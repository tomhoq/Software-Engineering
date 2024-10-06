package pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activity.domain.Activity;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activity.repository.ActivityRepository;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.domain.Enrollment;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.dto.EnrollmentDto;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.exceptions.HEException;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.user.domain.Volunteer;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.user.repository.UserRepository;

import java.util.Comparator;
import java.util.List;

import static pt.ulisboa.tecnico.socialsoftware.humanaethica.exceptions.ErrorMessage.*;

@Service
public class EnrollmentService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<EnrollmentDto> getEnrollmentsByActivity(Integer activityId) {
        if (activityId == null) throw  new HEException(ACTIVITY_NOT_FOUND);
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new HEException(ACTIVITY_NOT_FOUND, activityId));

        List<EnrollmentDto> enrollments = enrollmentRepository.getEnrollmentsByActivityId(activityId).stream()
                                        .sorted(Comparator.comparing(Enrollment::getEnrollmentDateTime))
                                        .map(EnrollmentDto::new)
                                        .toList();
        
        // Set isParticipating for each enrollment
        for (EnrollmentDto enrollment : enrollments) {
            boolean isParticipating = activity.getParticipations().stream()
                                .anyMatch(participation -> participation.getVolunteer().getId()
                                .equals(enrollment.getVolunteerId()));
            enrollment.setParticipating(isParticipating);
        }

        return enrollments;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<EnrollmentDto> getEnrollmentsByVolunteer(Integer userId) {
        if (userId == null) throw new HEException(USER_NOT_FOUND);
       
        return enrollmentRepository.getEnrollmentsByVolunteerId(userId).stream()
                .sorted(Comparator.comparing(Enrollment::getEnrollmentDateTime))
                .map(enrollment -> new EnrollmentDto(enrollment))
                .toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public EnrollmentDto createEnrollment(Integer userId, Integer activityId, EnrollmentDto enrollmentDto) {
        if (enrollmentDto == null) throw  new HEException(ENROLLMENT_REQUIRES_MOTIVATION);

        if (userId == null) throw new HEException(USER_NOT_FOUND);
        Volunteer volunteer = (Volunteer) userRepository.findById(userId).orElseThrow(() -> new HEException(USER_NOT_FOUND, userId));

        if (activityId == null) throw  new HEException(ACTIVITY_NOT_FOUND);
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new HEException(ACTIVITY_NOT_FOUND, activityId));

        Enrollment enrollment = new Enrollment(activity, volunteer, enrollmentDto);
        enrollmentRepository.save(enrollment);

        return new EnrollmentDto(enrollment);
    }
}
