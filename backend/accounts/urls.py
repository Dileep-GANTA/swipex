from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ApplicationListView,
    ApplyJobView,
    CompanyDetailView,
    CompanyListView,
    CustomTokenObtainPairView,
    FilterView,
    ForgotPasswordView,
    JobDetailView,
    JobListView,
    LogoutView,
    RecommendationView,
    RegisterView,
    ResetPasswordView,
    SaveJobView,
    SearchView,
    SwipeView,
    UserProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password_alias'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('auth/reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='auth_reset_password_alias'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('jobs/', JobListView.as_view(), name='job_list'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job_detail'),
    path('swipe/', SwipeView.as_view(), name='swipe_job'),
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
    path('companies/', CompanyListView.as_view(), name='company_list'),
    path('company/<int:pk>/', CompanyDetailView.as_view(), name='company_detail'),
    path('search/', SearchView.as_view(), name='job_search'),
    path('filter/', FilterView.as_view(), name='job_filter'),
    path('save-job/', SaveJobView.as_view(), name='save_job'),
    path('apply/', ApplyJobView.as_view(), name='apply_job'),
    path('applications/', ApplicationListView.as_view(), name='application_list'),
]

