from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class AccountsModuleTests(APITestCase):
    
    def setUp(self):
        """Set up initial mock data for the test cases."""
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('user_profile')
        
        self.valid_user_data = {
            "full_name": "John Doe",
            "email": "johndoe@example.com",
            "phone_number": "1234567890",
            "role": "Job Seeker",
            "password": "securepassword123",
            "confirm_password": "securepassword123"
        }

    def test_user_registration_success(self):
        """Verify that a user can successfully register with valid data."""
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, "johndoe@example.com")

    def test_user_registration_password_mismatch(self):
        """Verify registration fails if password and confirm_password do not match."""
        invalid_data = self.valid_user_data.copy()
        invalid_data["confirm_password"] = "mismatchedpassword"
        
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_jwt_login_success(self):
        """Verify that a registered user can log in and receive valid JWT tokens."""
        # Pre-register the user
        User.objects.create_user(
            email=self.valid_user_data["email"],
            full_name=self.valid_user_data["full_name"],
            phone_number=self.valid_user_data["phone_number"],
            role=self.valid_user_data["role"],
            password=self.valid_user_data["password"]
        )
        
        login_data = {
            "email": self.valid_user_data["email"],
            "password": self.valid_user_data["password"]
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.valid_user_data["email"])

    def test_protected_profile_api_denied_without_token(self):
        """Verify that accessing the profile endpoint without a JWT token returns 401 Unauthorized."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_profile_api_success_with_token(self):
        """Verify that a user can fetch their profile information using a valid JWT token."""
        user = User.objects.create_user(
            email=self.valid_user_data["email"],
            full_name=self.valid_user_data["full_name"],
            phone_number=self.valid_user_data["phone_number"],
            role=self.valid_user_data["role"],
            password=self.valid_user_data["password"]
        )
        
        # Authenticate via client credentials forcing token injection
        self.client.force_authenticate(user=user)
        
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.valid_user_data["email"])
        self.assertEqual(response.data["role"], self.valid_user_data["role"])

    def test_forgot_password_sends_reset_email_for_existing_user(self):
        """Verify that a registered user receives a password reset email."""
        user = User.objects.create_user(
            email=self.valid_user_data["email"],
            full_name=self.valid_user_data["full_name"],
            phone_number=self.valid_user_data["phone_number"],
            role=self.valid_user_data["role"],
            password=self.valid_user_data["password"],
        )

        response = self.client.post(reverse('auth_forgot_password'), {'email': user.email}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('password reset', mail.outbox[0].subject.lower())

    def test_forgot_password_alias_route_supports_auth_prefix(self):
        """Verify the auth-prefixed forgot-password endpoint returns success for an existing user."""
        user = User.objects.create_user(
            email=self.valid_user_data["email"],
            full_name=self.valid_user_data["full_name"],
            phone_number=self.valid_user_data["phone_number"],
            role=self.valid_user_data["role"],
            password=self.valid_user_data["password"],
        )

        response = self.client.post('/api/auth/forgot-password/', {'email': user.email}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_password_reset_with_valid_token_updates_password(self):
        """Verify that a valid reset token can set a new password."""
        user = User.objects.create_user(
            email=self.valid_user_data["email"],
            full_name=self.valid_user_data["full_name"],
            phone_number=self.valid_user_data["phone_number"],
            role=self.valid_user_data["role"],
            password=self.valid_user_data["password"],
        )

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            reverse('auth_reset_password', kwargs={'uidb64': uidb64, 'token': token}),
            {'password': 'newpassword123', 'confirm_password': 'newpassword123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('newpassword123'))

