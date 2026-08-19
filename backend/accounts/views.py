from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Application, Company, Job, SavedJob, SwipeHistory
from .serializers import (
    ApplicationSerializer,
    CompanySerializer,
    CustomTokenObtainPairSerializer,
    JobSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SavedJobSerializer,
    SwipeHistorySerializer,
    UserProfileSerializer,
    UserRegisterSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        reset_url = None
        if user is not None:
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/reset-password/{uidb64}/{token}/"
            try:
                send_mail(
                    subject="SwipeX Password Reset",
                    message=f"Use this link to reset your password: {reset_url}",
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@swipex.dev"),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as exc:
                if settings.DEBUG:
                    print(f"[password reset] send_mail failed: {exc}")

        response_payload = {"message": "If an account exists, a password reset link has been sent."}
        if settings.DEBUG and reset_url is not None:
            response_payload["reset_url"] = reset_url

        return Response(response_payload, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, uidb64, token):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid password reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "This password reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save()
        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class CompanyListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer
    queryset = Company.objects.all().order_by("-id")


class CompanyDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer
    queryset = Company.objects.all()


class JobListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer
    queryset = Job.objects.filter(is_active=True).select_related("company", "recruiter").order_by("-posted_at")

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer
    queryset = Job.objects.select_related("company", "recruiter").all()


class SwipeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        action = request.data.get("action", "left")
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        SwipeHistory.objects.get_or_create(user=request.user, job=job, action=action)
        return Response({"message": "Swipe recorded"}, status=status.HTTP_200_OK)


class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(is_active=True).order_by("-posted_at")
        user_skills = set(request.user.skills or [])
        user_location = (request.user.preferred_location or "").lower()
        scored = []
        for job in jobs:
            score = 0
            job_skills = set(job.required_skills or [])
            if user_skills & job_skills:
                score += 35
            if user_location and user_location in (job.location or "").lower():
                score += 25
            if request.user.experience and request.user.experience in (job.experience or ""):
                score += 20
            saved = SavedJob.objects.filter(user=request.user, job=job).exists()
            if saved:
                score += 15
            applied = Application.objects.filter(user=request.user, job=job).exists()
            if applied:
                score += 10
            if SwipeHistory.objects.filter(user=request.user, job=job, action="right").exists():
                score += 20
            scored.append((score, job))
        scored.sort(key=lambda item: item[0], reverse=True)
        serializer = JobSerializer([job for _, job in scored], many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("query", "").strip()
        jobs = Job.objects.filter(is_active=True).select_related("company")
        if query:
            jobs = jobs.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(location__icontains=query)
                | Q(job_type__icontains=query)
                | Q(required_skills__icontains=query)
                | Q(company__name__icontains=query)
            )
        serializer = JobSerializer(jobs.order_by("-posted_at"), many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class FilterView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(is_active=True).select_related("company")
        salary = request.query_params.get("salary")
        experience = request.query_params.get("experience")
        location = request.query_params.get("location")
        company = request.query_params.get("company")
        job_type = request.query_params.get("job_type")
        skills = request.query_params.get("skills")

        if salary:
            jobs = jobs.filter(salary__icontains=salary)
        if experience:
            jobs = jobs.filter(experience__icontains=experience)
        if location:
            jobs = jobs.filter(location__icontains=location)
        if company:
            jobs = jobs.filter(company__name__icontains=company)
        if job_type:
            jobs = jobs.filter(job_type__icontains=job_type)
        if skills:
            jobs = jobs.filter(required_skills__icontains=skills)

        serializer = JobSerializer(jobs.order_by("-posted_at"), many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        saved, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if created:
            return Response({"message": "Job saved successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Job already saved"}, status=status.HTTP_200_OK)

    def delete(self, request):
        job_id = request.query_params.get("job_id")
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = SavedJob.objects.filter(user=request.user, job_id=job_id).delete()
        return Response({"message": "Job removed", "deleted": deleted > 0}, status=status.HTTP_200_OK)


class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        application, created = Application.objects.get_or_create(user=request.user, job=job)
        if created:
            return Response({"message": "Application submitted successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message": "You already applied to this job"}, status=status.HTTP_200_OK)


class ApplicationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user).select_related("job", "job__company").order_by("-applied_at")