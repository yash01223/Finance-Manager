package com.finance.finance_manager.service;

import com.finance.finance_manager.dto.UserDTO;
import com.finance.finance_manager.entity.Role;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserRole(Long id, Role newRole, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot change your own role to avoid self-demotion.");
        }

        user.setRole(newRole);
        return convertToDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot delete your own account.");
        }

        // Check if this is the last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last administrator.");
            }
        }

        userRepository.delete(user);
    }

    private UserDTO convertToDTO(User user) {
        boolean isOnline = user.getLastSeen() != null && 
                          user.getLastSeen().isAfter(LocalDateTime.now().minusMinutes(5));
        
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .active(user.isActive())
                .lastSeen(user.getLastSeen())
                .isOnline(isOnline)
                .build();
    }
}
