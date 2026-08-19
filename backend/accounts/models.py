from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    """Custom manager for creating regular users and superusers."""

    def create_user(self, email, full_name, phone_number, role, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            full_name=full_name,
            phone_number=phone_number,
            role=role,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, phone_number, role="Recruiter", password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, full_name, phone_number, role, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Custom authentication user model that uses email as the login identifier."""

    ROLE_CHOICES = (
        ("Job Seeker", "Job Seeker"),
        ("Recruiter", "Recruiter"),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="Job Seeker")
    preferred_location = models.CharField(max_length=255, blank=True, null=True)
    preferred_salary = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    resume_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "phone_number"]

    def __str__(self):
        return self.email


class Company(models.Model):
    name = models.CharField(max_length=255)
    logo = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    employees = models.CharField(max_length=255, blank=True)
    founded = models.CharField(max_length=50, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="companies", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    required_skills = models.JSONField(default=list, blank=True)
    education = models.CharField(max_length=255, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    job_type = models.CharField(max_length=100, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posted_jobs")
    is_active = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class SwipeHistory(models.Model):
    ACTION_CHOICES = (
        ("left", "left"),
        ("right", "right"),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="swipes")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="swipes")
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "job")


class Application(models.Model):
    STATUS_CHOICES = (
        ("submitted", "submitted"),
        ("reviewing", "reviewing"),
        ("accepted", "accepted"),
        ("rejected", "rejected"),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "job")