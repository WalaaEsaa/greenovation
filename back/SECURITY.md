# Security Implementation Documentation

## Overview
This document outlines the security measures implemented in the Greenovation backend API.

## Security Measures Implemented

### 1. Authentication & Authorization
- **JWT Tokens**: JSON Web Tokens for user authentication
- **Role-based Access Control**: Different permissions for users, collectors, and sellers
- **Token Expiration**: Tokens expire after 24 hours
- **Secure Token Storage**: Tokens should be stored in httpOnly cookies or secure storage

### 2. Middleware Security
- **Helmet**: Sets various HTTP headers to protect against common attacks
- **Rate Limiting**: Limits requests to prevent abuse (100 requests per 15 minutes)
- **CORS Configuration**: Restricts cross-origin requests to approved domains
- **Input Validation**: Validates request bodies to prevent injection attacks

### 3. Database Security
- **Parameterized Queries**: Prevents SQL injection attacks
- **Environment Variables**: Sensitive data stored in .env file
- **Connection Pooling**: Secure database connection management

### 4. Password Security
- **Bcrypt Hashing**: Passwords are hashed with salt (10 rounds)
- **Password Validation**: Strong password requirements enforced

### 5. API Endpoint Security

#### Protected Endpoints
All endpoints that modify data require authentication:
- `POST /api/requests` - Users only
- `PUT /api/requests/collect` - Collectors only
- `POST /api/offers` - Sellers only
- `DELETE /api/offers/:id` - Sellers only (ownership verified)

#### Public Endpoints
- `POST /users` - Registration
- `POST /users/login` - Authentication
- `GET /api/offers` - View all offers
- `GET /api/requests/all` - View all requests

### 6. Security Headers
- **Content Security Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer information

### 7. Error Handling
- **Generic Error Messages**: Don't leak sensitive information
- **HTTP Status Codes**: Proper status codes for different error types
- **Logging**: Security events logged for monitoring

## Configuration

### Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Considerations
1. Change JWT_SECRET to a strong, random value
2. Update CORS origins to production domain
3. Enable HTTPS
4. Implement proper logging and monitoring
5. Regular security audits and updates

## Best Practices
1. Always validate and sanitize input
2. Use parameterized queries
3. Implement proper error handling
4. Regular security updates
5. Monitor for suspicious activity
6. Implement proper logging
7. Use secure communication protocols

## Testing Security
1. Test authentication endpoints
2. Verify role-based access control
3. Test input validation
4. Check for common vulnerabilities
5. Monitor rate limiting effectiveness
