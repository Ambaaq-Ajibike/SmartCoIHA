import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/app_theme.dart';
import 'models/data_request.dart';
import 'providers/auth_provider.dart';
import 'providers/data_request_provider.dart';
import 'providers/notification_provider.dart';
import 'screens/auth/fingerprint_login_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/data_requests/data_requests_screen.dart';
import 'screens/data_requests/fingerprint_approval_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/onboarding/email_verification_screen.dart';
import 'screens/onboarding/fingerprint_enrollment_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/splash_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/biometric_service.dart';
import 'services/storage_service.dart';

class SmartCoIHAApp extends StatelessWidget {
  const SmartCoIHAApp({super.key});

  @override
  Widget build(BuildContext context) {
    final storageService = StorageService();
    final apiService = ApiService(storageService);
    final authService = AuthService(apiService, storageService);
    final biometricService = BiometricService(storageService);

    return MultiProvider(
      providers: [
        Provider<StorageService>.value(value: storageService),
        Provider<ApiService>.value(value: apiService),
        Provider<AuthService>.value(value: authService),
        Provider<BiometricService>.value(value: biometricService),
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => DataRequestProvider(apiService)),
        ChangeNotifierProvider(create: (_) => NotificationProvider(apiService)),
      ],
      child: MaterialApp(
        title: 'SmartCoIHA',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
        initialRoute: '/',
        onGenerateRoute: _onGenerateRoute,
      ),
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const SplashScreen());

      case '/onboarding':
        final args = settings.arguments as Map<String, String>?;
        return MaterialPageRoute(
          builder: (_) => OnboardingScreen(
            patientId: args?['patientId'],
            institutionId: args?['institutionId'],
          ),
        );

      case '/email-verification':
        final args = settings.arguments as Map<String, String>;
        return MaterialPageRoute(
          builder: (_) => EmailVerificationScreen(
            patientId: args['patientId']!,
            institutionId: args['institutionId']!,
          ),
        );

      case '/fingerprint-enrollment':
        final args = settings.arguments as Map<String, String>;
        return MaterialPageRoute(
          builder: (_) => FingerprintEnrollmentScreen(patientId: args['patientId']!),
        );

      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());

      case '/fingerprint-login':
        return MaterialPageRoute(builder: (_) => const FingerprintLoginScreen());

      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());

      case '/data-requests':
        return MaterialPageRoute(builder: (_) => const DataRequestsScreen());

      case '/fingerprint-approval':
        final request = settings.arguments as DataRequest;
        return MaterialPageRoute(
          builder: (_) => FingerprintApprovalScreen(request: request),
        );

      case '/notifications':
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());

      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      case '/settings':
        return MaterialPageRoute(builder: (_) => const SettingsScreen());

      default:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
  }
}
