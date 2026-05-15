package com.example.auto;

import com.example.auto.model.User;
import com.example.auto.repository.UserRepository;
import com.example.auto.enums.UserStatus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableScheduling
public class AutoApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutoApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	CommandLineRunner run(UserRepository userRepository,
						  PasswordEncoder passwordEncoder) {

		return args -> {

			if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {

				User admin = new User();

				admin.setName("Default Admin");
				admin.setEmail("admin@gmail.com");
				admin.setPassword(passwordEncoder.encode("admin"));
				admin.setRole("ADMIN");
				admin.setStatus(UserStatus.ACTIVE);

				userRepository.save(admin);

				System.out.println("====================================");
				System.out.println("DEFAULT ADMIN CREATED");
				System.out.println("EMAIL: admin@gmail.com");
				System.out.println("PASSWORD: admin");
				System.out.println("====================================");
			}
		};
	}
}