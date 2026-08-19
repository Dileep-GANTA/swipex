from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Application, Company, Job, SavedJob, SwipeHistory

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone_number", "role", "password", "confirm_password"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            phone_number=validated_data.get("phone_number", ""),
            role=validated_data.get("role", "Job Seeker"),
            password=validated_data["password"],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Return a small user payload along with JWT tokens."""

    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        email = attrs.get("email")
        if email:
            attrs["username"] = email

        if not attrs.get("username"):
            raise serializers.ValidationError({"email": "Email is required."})

        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "full_name": self.user.full_name,
            "email": self.user.email,
            "role": self.user.role,
        }
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Validate the email address used to request a password reset."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validate the new password values for password reset."""

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for reading and updating the logged-in user's profile."""

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone_number",
            "role",
            "preferred_location",
            "preferred_salary",
            "experience",
            "skills",
            "resume_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "role", "created_at", "updated_at"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "logo", "description", "industry", "website", "location", "employees", "founded", "created_at"]


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(source="company", queryset=Company.objects.all(), write_only=True)
    recruiter_id = serializers.PrimaryKeyRelatedField(source="recruiter", queryset=User.objects.all(), write_only=True, required=False)

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "responsibilities",
            "required_skills",
            "education",
            "experience",
            "salary",
            "location",
            "job_type",
            "company",
            "company_id",
            "recruiter_id",
            "is_active",
            "posted_at",
        ]

    def create(self, validated_data):
        recruiter = validated_data.pop("recruiter", None) or self.context["request"].user
        validated_data["recruiter"] = recruiter
        return super().create(validated_data)


class SwipeHistorySerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = SwipeHistory
        fields = ["id", "job", "action", "created_at"]


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ["id", "job", "created_at"]


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "status", "applied_at"]