import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_constants.dart';
import 'storage_service.dart';

class ApiService {
  final StorageService _storageService;

  ApiService(this._storageService);

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storageService.getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> put(String endpoint, [Map<String, dynamic>? body]) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 401) {
      _storageService.deleteToken();
      throw ApiException('Session expired. Please log in again.', 401);
    }

    if (response.statusCode == 403) {
      throw ApiException('Access denied.', 403);
    }

    if (response.statusCode >= 500) {
      throw ApiException('Server error. Please try again later.', response.statusCode);
    }

    return body;
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => message;
}
