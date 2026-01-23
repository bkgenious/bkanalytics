# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing security@example.com. Do not open a public issue.

## Security Features

### Authentication
- Environment-based admin credentials
- Session tokens with HMAC-SHA256 signatures
- Timing-safe credential comparison
- Automatic session expiration (8 hours)
- HttpOnly, Secure, SameSite cookies

### Rate Limiting
- 60 requests/minute for general API
- 10 attempts/minute for authentication
- 20 uploads/minute for file uploads

### Input Validation
- All inputs sanitized before storage
- File type validation via MIME and magic numbers
- Path traversal prevention
- Maximum file size limits

### Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict-Transport-Security (HTTPS)
- Referrer-Policy

### CSRF Protection
- Origin validation for mutating requests

## Configuration Recommendations

1. Use strong admin password (16+ characters)
2. Generate unique SESSION_SECRET (32+ bytes)
3. Enable HTTPS in production
4. Keep dependencies updated
5. Review access logs regularly
