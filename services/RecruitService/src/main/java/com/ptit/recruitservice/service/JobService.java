package com.ptit.recruitservice.service;

import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.*;
import com.ptit.recruitservice.feign.UserServiceFeign;
import com.ptit.recruitservice.repository.JobRepository;
import com.ptit.recruitservice.repository.JobTagMappingRepository;
import com.ptit.recruitservice.repository.JobGroupTagMappingRepository;
import com.ptit.recruitservice.repository.JobTagRepository;
import com.ptit.recruitservice.repository.GroupJobTagRepository;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private JobTagMappingRepository jobTagMappingRepository;
    @Autowired
    private JobGroupTagMappingRepository jobGroupTagMappingRepository;
    @Autowired
    private JobTagRepository jobTagRepository;
    @Autowired
    private GroupJobTagRepository groupJobTagRepository;
    @Autowired
    private UserServiceFeign externalUserServiceFeignClient;
    @Autowired
    private EventPublisher eventPublisher;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Value("${embedding.exchange}")
    private String embeddingExchange;

    @Value("${embedding.jd.routing-key}")
    private String embeddingJDRoutingKey;

    @Value("${embedding.delete.jd.routing-key}")
    private String deleteJDRoutingKey;

    public CompanyResponse getCompanyByUserId(UUID userId) {
        return externalUserServiceFeignClient.getCompanyByUserId(userId, internalSecret);
    }

    public CompanyResponse getCompanyByCompanyId(UUID companyId) {
        return externalUserServiceFeignClient.getCompanyByCompanyId(companyId, internalSecret);
    }

    private String buildRawTextFromJD(Job job) {
        StringBuilder rawText = new StringBuilder();
        rawText.append("Job Title: ").append(job.getTitle()).append("\n");
        rawText.append("Description: ").append(job.getDescription()).append("\n");
        rawText.append("Job Type: ").append(job.getJobType()).append("\n");
        rawText.append("Location: ").append(job.getLocation()).append("\n");
        rawText.append("City: ").append(job.getCity());

        return rawText.toString().trim().replaceAll("\\s+", " ");
    }


    @Transactional
    public JobDto createJob(JobCreateRequest request, UUID currentUserId) {
        CompanyResponse company = getCompanyByUserId(currentUserId);
        UUID companyId = company.getCompanyId();
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setLocation(request.getLocation());
        job.setCity(request.getCity());
        job.setExperience(request.getExperience());
        job.setQuantity(request.getQuantity());
        job.setDeadline(request.getDeadline());
        job.setCreatedBy(currentUserId);
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job.setStatus(Job.Status.pending);
        job.setStatusEmbedding(Job.StatusEmbedding.pending);
        job.setIsDeleted(false);
        job.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Bulk map JobTag
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                .map(tagId -> {
                    JobTagMapping mapping = new JobTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setJobTag(jobTagRepository.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk map GroupJobTag
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                .map(groupTagId -> {
                    JobGroupTagMapping mapping = new JobGroupTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi sang RecommendService để embedding
        Map<String, Object> event1 = new HashMap<>();
        String rawText = buildRawTextFromJD(savedJob);
        event1.put("job_id", job.getJobId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingJDRoutingKey, event1);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("EMPLOYER")
                        .action("CREATE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã tạo công việc mới %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName() ))
                        .build()
        );
        return toDto(job);
    }

    @Transactional
    public JobDto createJobForAdmin(JobCreateRequestForAdmin request, UUID currentUserId) {
        UUID companyId = request.getCompanyId();
        CompanyResponse company = getCompanyByCompanyId(companyId);
        Job job = new Job();
        job.setCompanyId(company.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setLocation(request.getLocation());
        job.setCity(request.getCity());
        job.setQuantity(request.getQuantity());
        job.setCreatedBy(currentUserId);
        job.setDeadline(request.getDeadline());
        job.setExperience(request.getExperience());
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job.setStatus(request.getStatus());
        job.setStatusEmbedding(Job.StatusEmbedding.pending);
        job.setIsDeleted(false);
        job.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Bulk map JobTag
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                    .map(tagId -> {
                        JobTagMapping mapping = new JobTagMapping();
                        mapping.setJob(savedJob);
                        mapping.setJobTag(jobTagRepository.findById(tagId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                        return mapping;
                    }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk map GroupJobTag
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                    .map(groupTagId -> {
                        JobGroupTagMapping mapping = new JobGroupTagMapping();
                        mapping.setJob(savedJob);
                        mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                        return mapping;
                    }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi sang RecommendService để embedding
        Map<String, Object> event1 = new HashMap<>();
        String rawText = buildRawTextFromJD(savedJob);
        event1.put("job_id", job.getJobId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingJDRoutingKey, event1);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("CREATE_JOB_ADMIN")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Quản trị viên %s đã tạo công việc mới %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName() ))
                        .build()
        );
        return toDto(job);
    }

    public JobDto getJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));


        List<JobTag> jobTags = jobTagRepository.findAllByJobId(jobId);
        List<GroupJobTag> groupJobTags = groupJobTagRepository.findAllByJobId(jobId);

        JobDto dto = toDto(job);
        dto.setJobTags(
                jobTags.stream().map(t -> {
                    JobTagDto tagDto = new JobTagDto();
                    tagDto.setJobTagId(t.getJobTagId());
                    tagDto.setJobName(t.getJobName());
                    tagDto.setIsDeleted(t.getIsDeleted());
                    return tagDto;
                }).toList()
        );
        dto.setGroupJobTags(
                groupJobTags.stream().map(t -> {
                   GroupJobTagDto groupJobTagDto = new GroupJobTagDto();
                    groupJobTagDto.setGroupTagId(t.getGroupTagId());
                    groupJobTagDto.setGroupJobName(t.getGroupJobName());
                    groupJobTagDto.setIsDeleted(t.getIsDeleted());
                    return groupJobTagDto;
                }).toList()
        );

        return dto;
    }

    @Transactional
    public JobDto updateJob(UUID jobId, JobUpdateRequest request, UUID currentUserId) {
        UUID companyId = getCompanyByUserId(currentUserId).getCompanyId();
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        if(!job.getCompanyId().equals(companyId)) {
            throw new AccessDeniedException("You do not have permission to update this job");
        }
        try {
            Job.JobType.valueOf(request.getJobType().replace("|", "_"));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid jobType: " + request.getJobType());
        }
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setUpdatedBy(currentUserId);
        job.setLocation(request.getLocation());
        job.setExperience(request.getExperience());
        job.setCity(request.getCity());
        job.setQuantity(request.getQuantity());
        job.setDeadline(request.getDeadline());
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job.setStatusEmbedding(Job.StatusEmbedding.pending);
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Remove old mappings
        jobTagMappingRepository.deleteByJob_JobId(jobId);
        jobGroupTagMappingRepository.deleteByJob_JobId(jobId);
        // Bulk add new JobTag mappings
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                .map(tagId -> {
                    JobTagMapping mapping = new JobTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setJobTag(jobTagRepository.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk add new GroupJobTag mappings
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                .map(groupTagId -> {
                    JobGroupTagMapping mapping = new JobGroupTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi sang RecommendService để embedding
        Map<String, Object> event1 = new HashMap<>();
        String rawText = buildRawTextFromJD(savedJob);
        event1.put("job_id", job.getJobId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingJDRoutingKey, event1);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByUserId(currentUserId);
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("EMPLOYER")
                        .action("UPDATE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã cập nhật công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    @Transactional
    public JobDto updateJobForAdmin(UUID jobId, JobUpdateRequestForAdmin request, UUID currentUserId) {
        UUID companyId = request.getCompanyId();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        if(!job.getCompanyId().equals(companyId)) {
            throw new AccessDeniedException("You do not have permission to update this job");
        }
        try {
            Job.JobType.valueOf(request.getJobType().replace("|", "_"));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid jobType: " + request.getJobType());
        }
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setLocation(request.getLocation());
        job.setUpdatedBy(currentUserId);
        job.setExperience(request.getExperience());
        job.setCity(request.getCity());
        job.setQuantity(request.getQuantity());
        job.setDeadline(request.getDeadline());
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job.setStatus(request.getStatus());
        job.setStatusEmbedding(Job.StatusEmbedding.pending);
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Remove old mappings
        jobTagMappingRepository.deleteByJob_JobId(jobId);
        jobGroupTagMappingRepository.deleteByJob_JobId(jobId);
        // Bulk add new JobTag mappings
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                    .map(tagId -> {
                        JobTagMapping mapping = new JobTagMapping();
                        mapping.setJob(savedJob);
                        mapping.setJobTag(jobTagRepository.findById(tagId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                        return mapping;
                    }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk add new GroupJobTag mappings
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                    .map(groupTagId -> {
                        JobGroupTagMapping mapping = new JobGroupTagMapping();
                        mapping.setJob(savedJob);
                        mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                        return mapping;
                    }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi sang RecommendService để embedding
        Map<String, Object> event1 = new HashMap<>();
        String rawText = buildRawTextFromJD(savedJob);
        event1.put("job_id", job.getJobId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingJDRoutingKey, event1);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("UPDATE_JOB_ADMIN")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Quản trị viên %s đã cập nhật công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    public JobDto deleteJob(UUID jobId, UUID currentUserId, boolean isAdmin) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        job.setIsDeleted(true);
        job = jobRepository.save(job);

        // Gửi sang RecommendService để xóa embedding
        Map<String, Object> event1 = new HashMap<>();
        event1.put("job_id", job.getJobId());
        eventPublisher.publish(embeddingExchange, deleteJDRoutingKey, event1);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("DELETE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã xóa công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    public List<JobDto> getAllJobs() {
        return jobRepository.findByIsDeletedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }
    public List<JobDto> filterJobs(
            String keyword,
            String location,
            List<String> industry,
            List<String> tags,
            String type,
            Integer minSalary,
            Integer maxSalary,
            String experience
    ) {
        List<Job> jobs = jobRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // chỉ lấy job chưa xóa
            predicates.add(cb.isFalse(root.get("isDeleted")));

            // 🔹 Từ khóa (tên công việc)
            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + keyword.toLowerCase() + "%"
                ));
            }

            // 🔹 Location (tỉnh/thành hoặc city)
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"
                ));
            }
            if (experience != null && !experience.trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("experience")),
                        "%" + experience.toLowerCase() + "%"
                ));
            }
            // 🔹 Industry (groupJobName)
            if (industry != null && !industry.isEmpty()) {
                Join<Object, Object> groupJoin = root.join("jobGroupTagMappings", JoinType.LEFT)
                        .join("groupJobTag", JoinType.LEFT);
                predicates.add(cb.lower(groupJoin.get("groupJobName")).in(
                        industry.stream().map(String::toLowerCase).toList()
                ));
            }

            // 🔹 Tags (jobName)
            if (tags != null && !tags.isEmpty()) {
                Join<Object, Object> tagJoin = root.join("jobTagMappings", JoinType.LEFT)
                        .join("jobTag", JoinType.LEFT);
                predicates.add(cb.lower(tagJoin.get("jobName")).in(
                        tags.stream().map(String::toLowerCase).toList()
                ));
            }

            // 🔹 Type (full_time, part_time,...)
            if (type != null && !type.isEmpty()) {
                predicates.add(cb.equal(root.get("jobType"), type));
            }

            // 🔹 Salary (min - max triệu)
            if (minSalary != null && maxSalary != null) {
                int min = minSalary * 1_000_000;
                int max = maxSalary * 1_000_000;
                predicates.add(cb.and(
                        cb.lessThanOrEqualTo(root.get("minSalary"), max),
                        cb.greaterThanOrEqualTo(root.get("maxSalary"), min)
                ));
            } else if (minSalary != null) {
                int min = minSalary * 1_000_000;
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxSalary"), min));
            } else if (maxSalary != null) {
                int max = maxSalary * 1_000_000;
                predicates.add(cb.lessThanOrEqualTo(root.get("minSalary"), max));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        });

        return jobs.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobDto> getAllJobsByCompany(UUID companyId) {
        return jobRepository.findByCompanyIdAndIsDeletedFalse(companyId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobDto> getAllJobsByCity(String city) {
        return jobRepository.findByCityAndIsDeletedFalse(city).stream().map(this::toDto).collect(Collectors.toList());
    }
    public List<JobDto> searchJobs(String keyword, String location) {
        List<Job> jobs = jobRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + keyword.toLowerCase() + "%"
                ));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("city")),
                        "%" + location.toLowerCase() + "%"
                ));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        });

        return jobs.stream().map(this::toDto).collect(Collectors.toList());
    }
    @Transactional
    public JobDto closeJob(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        boolean isEmployer = company != null && job.getCompanyId().equals(company.getCompanyId());
        boolean isAdmin = company == null;
        if (!isEmployer && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền đóng công việc này");
        }
        if (job.getStatus() == Job.Status.closed) {
            throw new BusinessException("Công việc đã được đóng trước đó");
        }
        job.setStatus(Job.Status.closed);
        job = jobRepository.save(job);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("CLOSE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã đóng công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    @Transactional
    public JobDto approveJob(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        if (job.getStatus() == Job.Status.open) {
            throw new BusinessException("Công việc đã được mở trước đó");
        }
        job.setStatus(Job.Status.open);
        job = jobRepository.save(job);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("APPROVE_JOB")
                        .targetType("JOB")
                        .targetId(jobId.toString())
                        .description(String.format("Quản trị viên %s đã duyệt công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs daily at 0:00 AM
    @Transactional
    public void closeExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findByStatusAndDeadlineBefore(Job.Status.open, Timestamp.from(Instant.now()));
        for (Job job : expiredJobs) {
            job.setStatus(Job.Status.closed);
            jobRepository.save(job);
        }
    }

    @Transactional
    public JobDto updateStatusEmbedding(UUID jobId, Job.StatusEmbedding status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        if (status == null) {
            throw new BusinessException("status must be provided");
        }
        if (Job.StatusEmbedding.embedded.equals(status)) {
            job.setStatusEmbedding(Job.StatusEmbedding.embedded);
        } else if (Job.StatusEmbedding.failed.equals(status)) {
            job.setStatusEmbedding(Job.StatusEmbedding.failed);
        } else {
            throw new BusinessException("Invalid statusEmbedding: " + status + ". Allowed values: embedded, failed");
        }
        job = jobRepository.save(job);
        return toDto(job);
    }

    @Transactional
    public JobDto retryEmbedding(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        job.setStatusEmbedding(Job.StatusEmbedding.pending);
        job = jobRepository.save(job);

        // Gửi sang RecommendService để embedding lại
        Map<String, Object> event = new HashMap<>();
        String rawText = buildRawTextFromJD(job);
        event.put("job_id", job.getJobId());
        event.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingJDRoutingKey, event);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByUserId(currentUserId);
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("EMPLOYER")
                        .action("RETRY_EMBEDDING")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Người dùng %s đã thử lại embedding cho công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    private JobDto toDto(Job job) {
        JobDto dto = new JobDto();
        dto.setJobId(job.getJobId());
        dto.setCompanyId(job.getCompanyId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setMinSalary(job.getMinSalary());
        dto.setMaxSalary(job.getMaxSalary());
        dto.setLocation(job.getLocation());
        dto.setCity(job.getCity());
        dto.setQuantity(job.getQuantity());
        dto.setExperience(job.getExperience());
        dto.setDeadline(job.getDeadline());
        dto.setJobType(job.getJobType().name());
        dto.setStatus(job.getStatus().name());
        dto.setStatusEmbedding(job.getStatusEmbedding().name());
        dto.setDeleted(Boolean.TRUE.equals(job.getIsDeleted()));
        dto.setCreatedAt(job.getCreatedAt());
        dto.setCreatedBy(job.getCreatedBy());
        dto.setUpdatedBy(job.getUpdatedBy());
        return dto;
    }
}
