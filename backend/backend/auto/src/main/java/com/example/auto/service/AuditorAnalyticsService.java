package com.example.auto.service;

import com.example.auto.model.AuditLog;
import com.example.auto.model.Request;
import com.example.auto.model.User;
import com.example.auto.model.Workflow;
import com.example.auto.repository.AuditLogRepository;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.UserRepository;
import com.example.auto.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditorAnalyticsService {

    private final RequestRepository requestRepo;
    private final AuditLogRepository auditLogRepo;
    private final WorkflowRepository workflowRepo;
    private final UserRepository userRepo;

    // 1. Approval Trend Prediction
    public Map<String, Object> getApprovalTrend() {
        LocalDateTime from = LocalDateTime.now().minusMonths(6).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        List<Object[]> rows = requestRepo.findApprovedCountsByMonthSince(from);

        List<Map<String, Object>> monthly = new ArrayList<>();
        List<Double> ys = new ArrayList<>();
        int i = 0;
        for (Object[] row : rows) {
            String ym = (String) row[0];
            long count = ((Number) row[1]).longValue();
            Map<String, Object> m = new HashMap<>();
            m.put("month", ym);
            m.put("count", count);
            monthly.add(m);
            ys.add((double) count);
            i++;
        }

        double predicted = ys.isEmpty() ? 0.0 : linearRegressionPredictNext(ys);

        Map<String, Object> resp = new HashMap<>();
        resp.put("monthly", monthly);
        resp.put("predictedNextMonth", predicted);
        return resp;
    }

    private double linearRegressionPredictNext(List<Double> ys) {
        int n = ys.size();
        if (n == 1) return ys.get(0);
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (int i = 0; i < n; i++) {
            double x = i;
            double y = ys.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }
        double denom = (n * sumXX - sumX * sumX);
        if (denom == 0) return ys.get(n - 1);
        double a = (n * sumXY - sumX * sumY) / denom;
        double b = (sumY - a * sumX) / n;
        double nextX = n;
        double pred = a * nextX + b;
        return Math.max(pred, 0.0);
    }

    // 2. Bottleneck Detection
    public Map<String, Object> getBottlenecks() {
        List<AuditLog> logs = auditLogRepo.findAll();
        Map<Long, Request> requests = requestRepo.findAll().stream()
                .collect(Collectors.toMap(Request::getId, r -> r));

        // average approval time per role (hours)
        Map<String, List<Long>> roleDurations = new HashMap<>();
        for (AuditLog log : logs) {
            if (!"APPROVED".equalsIgnoreCase(log.getAction())) continue;
            Request r = requests.get(log.getRequestId());
            if (r == null || r.getCreatedAt() == null || log.getActionAt() == null) continue;
            long hours = ChronoUnit.HOURS.between(r.getCreatedAt(), log.getActionAt());
            roleDurations.computeIfAbsent(log.getRole(), k -> new ArrayList<>()).add(hours);
        }

        List<Map<String, Object>> perRole = new ArrayList<>();
        String worstRole = null;
        double worstAvg = -1;

        for (Map.Entry<String, List<Long>> e : roleDurations.entrySet()) {
            String role = e.getKey();
            List<Long> ds = e.getValue();
            double avg = ds.stream().mapToLong(Long::longValue).average().orElse(0);
            Map<String, Object> m = new HashMap<>();
            m.put("role", role);
            m.put("avgApprovalHours", avg);
            perRole.add(m);
            if (avg > worstAvg) {
                worstAvg = avg;
                worstRole = role;
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("roles", perRole);
        resp.put("bottleneckRole", worstRole);
        resp.put("bottleneckAvgHours", worstAvg);
        return resp;
    }

    // 3. Department Risk Score
    public List<Map<String, Object>> getDepartmentRiskScores() {
        List<Request> requests = requestRepo.findAll();
        Map<Long, User> users = userRepo.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // group by "department" = initiator role (since we don't have department field)
        Map<String, List<Request>> byDept = new HashMap<>();
        for (Request r : requests) {
            User initiator = users.get(r.getInitiatorId());
            String dept = initiator != null ? initiator.getRole() : "UNKNOWN";
            byDept.computeIfAbsent(dept, k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (Map.Entry<String, List<Request>> e : byDept.entrySet()) {
            String dept = e.getKey();
            List<Request> rs = e.getValue();
            if (rs.isEmpty()) continue;

            long total = rs.size();
            long rejected = rs.stream().filter(r -> "REJECTED".equalsIgnoreCase(r.getStatus())).count();
            long slaBreached = rs.stream().filter(r -> {
                String s = String.valueOf(r.getStatus());
                return s.startsWith("ESCALATED") || s.startsWith("PENDING_ESCALATED") || "AUTO_REJECTED".equalsIgnoreCase(s);
            }).count();
            long highAmount = rs.stream().filter(this::isHighAmountRequest).count();

            double rejectionRate = total == 0 ? 0 : (double) rejected / total;
            double slaRate = total == 0 ? 0 : (double) slaBreached / total;
            double highAmtRate = total == 0 ? 0 : (double) highAmount / total;

            double risk = rejectionRate * 0.4 + slaRate * 0.4 + highAmtRate * 0.2;

            Map<String, Object> m = new HashMap<>();
            m.put("department", dept);
            m.put("riskScore", risk);
            m.put("rejectionRate", rejectionRate);
            m.put("slaBreachRate", slaRate);
            m.put("highAmountRate", highAmtRate);
            out.add(m);
        }
        return out;
    }

    private boolean isHighAmountRequest(Request r) {
        try {
            String data = r.getRequestData();
            if (data == null || !data.contains("amount")) return false;
            // very lightweight parse: look for "amount":number
            String cleaned = data.replaceAll("\\s", "");
            int idx = cleaned.indexOf("\"amount\"");
            if (idx < 0) return false;
            int colon = cleaned.indexOf(":", idx);
            if (colon < 0) return false;
            int end = colon + 1;
            while (end < cleaned.length() && (Character.isDigit(cleaned.charAt(end)) || cleaned.charAt(end) == '.')) {
                end++;
            }
            double amt = Double.parseDouble(cleaned.substring(colon + 1, end));
            return amt >= 50000;
        } catch (Exception ex) {
            return false;
        }
    }

    // 4. Approver Performance Ranking
    public List<Map<String, Object>> getApproverPerformanceRanking() {
        List<AuditLog> logs = auditLogRepo.findAll();
        Map<Long, Request> requests = requestRepo.findAll().stream()
                .collect(Collectors.toMap(Request::getId, r -> r));
        Map<Long, Workflow> workflows = workflowRepo.findAll().stream()
                .collect(Collectors.toMap(Workflow::getId, w -> w));

        Map<Long, List<Long>> approverDurations = new HashMap<>();
        Map<Long, int[]> approverSla = new HashMap<>(); // [within, total]

        for (AuditLog log : logs) {
            if (!"APPROVED".equalsIgnoreCase(log.getAction())) continue;
            if (log.getApproverId() == null) continue;
            Request r = requests.get(log.getRequestId());
            if (r == null || r.getCreatedAt() == null || log.getActionAt() == null) continue;
            Workflow wf = workflows.get(r.getWorkflowId());
            if (wf == null || wf.getEscalationHours() <= 0) continue;

            long minutes = ChronoUnit.MINUTES.between(r.getCreatedAt(), log.getActionAt());
            approverDurations.computeIfAbsent(log.getApproverId(), k -> new ArrayList<>()).add(minutes);

            int[] sla = approverSla.computeIfAbsent(log.getApproverId(), k -> new int[2]);
            sla[1] += 1; // total
            long slaMinutes = wf.getEscalationHours() * 60L;
            if (minutes <= slaMinutes) sla[0] += 1; // within SLA
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (Map.Entry<Long, List<Long>> e : approverDurations.entrySet()) {
            Long approverId = e.getKey();
            List<Long> ds = e.getValue();
            double avgMinutes = ds.stream().mapToLong(Long::longValue).average().orElse(0);
            int[] sla = approverSla.getOrDefault(approverId, new int[]{0, 0});
            double slaCompliance = sla[1] == 0 ? 0.0 : (double) sla[0] / sla[1];

            Map<String, Object> m = new HashMap<>();
            m.put("approverId", approverId);
            m.put("avgApprovalMinutes", avgMinutes);
            m.put("slaCompliance", slaCompliance);
            out.add(m);
        }

        // sort: best = lowest avg time, then highest SLA compliance
        out.sort(Comparator
                .comparingDouble((Map<String, Object> m) -> (Double) m.get("avgApprovalMinutes"))
                .thenComparing((Map<String, Object> m) -> (Double) m.get("slaCompliance"), Comparator.reverseOrder()));

        return out;
    }
}

