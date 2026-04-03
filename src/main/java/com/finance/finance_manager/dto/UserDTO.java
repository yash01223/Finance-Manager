package com.finance.finance_manager.dto;

import com.finance.finance_manager.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private Role role;
    private boolean active;
    private LocalDateTime lastSeen;
    private boolean isOnline;
}
