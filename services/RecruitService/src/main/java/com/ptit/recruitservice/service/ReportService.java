package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.ApplicantDTO;
import com.ptit.recruitservice.dto.JobEngagementDTO;
import com.ptit.recruitservice.dto.JobPerformanceDTO;
import com.ptit.recruitservice.dto.MonthlyRecruitmentSummaryDTO;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.repository.ApplicationRepository;
import com.ptit.recruitservice.repository.FavoriteJobRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private FavoriteJobRepository favoriteJobRepository;

    private Timestamp[] monthRange(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);
        ZoneId zone = ZoneId.systemDefault();
        return new Timestamp[]{ Timestamp.from(start.atZone(zone).toInstant()), Timestamp.from(end.atZone(zone).toInstant()) };
    }

    public MonthlyRecruitmentSummaryDTO getMonthlySummary(int year, int month) {
        Timestamp[] range = monthRange(year, month);
        Timestamp start = range[0], end = range[1];

        long openJobs = jobRepository.countByStatusAndIsDeletedFalse(Job.Status.open);
        long jobsCreated = jobRepository.countByCreatedAtBetween(start, end);
        long jobsClosed = jobRepository.countByStatusAndCreatedAtBetween(Job.Status.closed, start, end);

        long totalApplied = applicationRepository.countByAppliedAtBetween(start, end);
        long shortlisted = applicationRepository.countByStatusAndAppliedAtBetween(com.ptit.recruitservice.entity.Application.Status.approved, start, end); // mapping: approved -> shortlisted
        long rejected = applicationRepository.countByStatusAndAppliedAtBetween(com.ptit.recruitservice.entity.Application.Status.rejected, start, end);
        long hired = applicationRepository.countByStatusAndAppliedAtBetween(com.ptit.recruitservice.entity.Application.Status.approved, start, end);; // no hired concept in Application.Status in current model; keep 0

        return new MonthlyRecruitmentSummaryDTO(openJobs, jobsCreated, jobsClosed, totalApplied, shortlisted, rejected, hired);
    }

    public List<JobPerformanceDTO> getJobPerformance(int year, int month) {
        Timestamp[] range = monthRange(year, month);
        Timestamp start = range[0], end = range[1];

        List<Job> jobs = jobRepository.findByIsDeletedFalse();
        List<JobPerformanceDTO> out = new ArrayList<>();
        for (Job j : jobs) {
            UUID jid = j.getJobId();
            long applied = applicationRepository.countByJob_JobIdAndAppliedAtBetween(jid, start, end);
            long shortlisted = applicationRepository.countByJob_JobIdAndStatusAndAppliedAtBetween(jid, com.ptit.recruitservice.entity.Application.Status.approved, start, end);
            long rejected = applicationRepository.countByJob_JobIdAndStatusAndAppliedAtBetween(jid, com.ptit.recruitservice.entity.Application.Status.rejected, start, end);
            long hired = applicationRepository.countByJob_JobIdAndStatusAndAppliedAtBetween(jid, com.ptit.recruitservice.entity.Application.Status.approved, start, end);
            long favorite = favoriteJobRepository.countByJob_JobIdAndCreatedAtBetween(jid, start, end);
            out.add(new JobPerformanceDTO(jid.toString(), j.getTitle(), applied, shortlisted, rejected, hired, favorite));
        }
        return out;
    }

    public Page<com.ptit.recruitservice.entity.Application> getApplicantsRaw(int year, int month, Pageable pageable) {
        Timestamp[] range = monthRange(year, month);
        return applicationRepository.findByAppliedAtBetween(range[0], range[1], pageable);
    }

    public Page<com.ptit.recruitservice.dto.ApplicantDTO> getApplicants(int year, int month, UUID jobId, Pageable pageable) {
        Timestamp[] range = monthRange(year, month);
        // Map Application entities to ApplicantDTO
        Page<com.ptit.recruitservice.entity.Application> page = applicationRepository.findByAppliedAtBetween(range[0], range[1], pageable);
        return page.map(a -> new ApplicantDTO(a.getApplicationId(), a.getCv() != null ? a.getCv().getCvId() : null,
                a.getCv() != null ? a.getCv().getTitle() : null,
                a.getJob() != null ? a.getJob().getJobId() : null,
                a.getJob() != null ? a.getJob().getTitle() : null,
                a.getStatus() != null ? a.getStatus().name() : null,
                a.getAppliedAt()));
    }

    public List<JobEngagementDTO> getJobEngagement(int year, int month) {
        Timestamp[] range = monthRange(year, month);
        Timestamp start = range[0], end = range[1];
        List<Job> jobs = jobRepository.findByIsDeletedFalse();
        List<JobEngagementDTO> out = new ArrayList<>();
        for (Job j : jobs) {
            UUID jid = j.getJobId();
            long applies = applicationRepository.countByJob_JobIdAndAppliedAtBetween(jid, start, end);
            long favorites = favoriteJobRepository.countByJob_JobIdAndCreatedAtBetween(jid, start, end);
            long interest = favorites + 2 * applies;
            out.add(new JobEngagementDTO(jid.toString(), j.getTitle(), favorites, applies, interest));
        }
        return out;
    }
}

