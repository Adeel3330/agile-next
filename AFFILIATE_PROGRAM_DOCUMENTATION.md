# Affiliate Program Module - Complete Documentation

## Overview
This module provides a complete affiliate program system for a medical billing website, allowing affiliates to refer leads and applications, with automatic fee calculation and commission tracking.

## Database Schema

### Tables Created

1. **affiliates** - Stores affiliate partner information
2. **affiliate_applications** - Tracks applications submitted through affiliates
3. **affiliate_leads** - Tracks leads generated via affiliate links
4. **payouts** - Tracks affiliate commission payouts

### Key Features
- Automatic affiliate code generation
- Soft deletes (deleted_at field)
- Automatic timestamp updates
- Indexed for performance

## Business Logic

### Application Fee Calculation
- **Individual Providers**: $0.00 (Free)
- **Medical Groups**: $50.00 per application

This is automatically calculated when an application is created via the `calculate_application_fee()` function.

### Affiliate Status Flow
1. **pending** - New affiliate, awaiting approval
2. **active** - Approved and can receive leads/applications
3. **inactive** - Temporarily disabled
4. **blocked** - Permanently blocked

### Lead Attribution
- Leads are tracked via affiliate links using `affiliate_code`
- Each lead captures:
  - IP address
  - User agent
  - Referrer URL
  - Source (landing page, form, etc.)
- Leads can be marked as "converted" when they become applications

### Commission Calculation
- Default commission rate: 10%
- Can be customized per affiliate
- Calculated on application fees
- Tracked in payouts table

## API Routes

### Admin Routes (JWT Protected)

#### Affiliates Management
- `GET /api/admin/affiliates` - List all affiliates (with search, pagination, status filter)
- `POST /api/admin/affiliates` - Create new affiliate
- `GET /api/admin/affiliates/[id]` - Get affiliate details
- `PUT /api/admin/affiliates/[id]` - Update affiliate
- `DELETE /api/admin/affiliates/[id]` - Soft delete affiliate

#### Applications Management
- `GET /api/admin/affiliate-applications` - List all applications (with filters)
- `GET /api/admin/affiliate-applications/[id]` - Get application details
- `PUT /api/admin/affiliate-applications/[id]` - Update application (approve/reject)
- `DELETE /api/admin/affiliate-applications/[id]` - Soft delete application

#### Leads Management
- `GET /api/admin/affiliate-leads` - List all leads (with filters)
- `GET /api/admin/affiliate-leads/export` - Export leads as CSV

#### Payouts Management
- `GET /api/admin/payouts` - List all payouts
- `POST /api/admin/payouts` - Create new payout

### Public Routes (No Authentication)

#### Application Submission
- `POST /api/affiliate/apply` - Submit application through affiliate link
  - Requires: `affiliateCode`, `name`, `email`, `phone`, `providerType`
  - Automatically calculates fee based on provider type
  - Creates lead record with conversion tracking

#### Lead Tracking
- `POST /api/affiliate/lead` - Track lead via affiliate link
  - Requires: `affiliateCode`
  - Optional: `name`, `email`, `phone`, `source`
  - Captures IP, user agent, referrer automatically

## Usage Examples

### 1. Create Affiliate
```javascript
POST /api/admin/affiliates
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "companyName": "Medical Marketing Co",
  "website": "https://example.com",
  "commissionRate": 15.00,
  "status": "active"
}
```

### 2. Submit Application via Affiliate Link
```javascript
POST /api/affiliate/apply
{
  "affiliateCode": "AFF-ABC12345",
  "name": "Dr. Jane Smith",
  "email": "jane@clinic.com",
  "phone": "555-1234",
  "providerType": "group"  // or "individual"
}
// Returns: { applicationFee: 50.00 } for groups, { applicationFee: 0.00 } for individuals
```

### 3. Track Lead
```javascript
POST /api/affiliate/lead
{
  "affiliateCode": "AFF-ABC12345",
  "name": "Potential Client",
  "email": "client@example.com",
  "phone": "555-5678",
  "source": "landing_page"
}
```

### 4. Export Leads to CSV
```javascript
GET /api/admin/affiliate-leads/export?affiliate_id=xxx&converted=true&start_date=2024-01-01&end_date=2024-12-31
// Returns CSV file download
```

### 5. Create Payout
```javascript
POST /api/admin/payouts
{
  "affiliateId": "uuid-here",
  "amount": 500.00,
  "commissionRate": 10.00,
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "status": "paid",
  "paymentMethod": "bank_transfer",
  "paymentReference": "TXN-123456"
}
```

## Admin Panel Integration

To integrate with your admin panel, you'll need to create:

1. **Affiliates List Page** (`/admin/affiliates`)
   - Table with search, pagination
   - Actions: View, Edit, Approve, Block, Delete
   - Status badges

2. **Applications List Page** (`/admin/affiliate-applications`)
   - Filter by affiliate, status, provider type
   - Actions: Approve, Reject, View Details
   - Show application fee prominently

3. **Leads List Page** (`/admin/affiliate-leads`)
   - Filter by affiliate, converted status
   - Export to CSV button
   - Show conversion rate

4. **Payouts List Page** (`/admin/payouts`)
   - Filter by affiliate, status, date range
   - Create payout form
   - Payment tracking

## Security Considerations

1. **JWT Authentication** - All admin routes require valid JWT token
2. **Input Validation** - All inputs are validated and sanitized
3. **SQL Injection Protection** - Using Supabase parameterized queries
4. **Rate Limiting** - Consider adding rate limiting for public routes
5. **IP Tracking** - Captured for fraud prevention

## Database Setup

1. Run the SQL schema file in Supabase SQL Editor:
   ```sql
   -- Copy contents from database/affiliate-schema.sql
   ```

2. Verify tables are created:
   - affiliates
   - affiliate_applications
   - affiliate_leads
   - payouts

3. Test triggers:
   - Affiliate code auto-generation
   - Timestamp updates

## Testing Checklist

- [ ] Create affiliate via admin API
- [ ] Submit application via public API (individual - free)
- [ ] Submit application via public API (group - $50)
- [ ] Track lead via public API
- [ ] Export leads to CSV
- [ ] Approve/reject application via admin
- [ ] Create payout via admin
- [ ] Filter and search functionality
- [ ] Soft delete functionality

## Future Enhancements

1. Email notifications for affiliates
2. Dashboard for affiliates to view their stats
3. Automated payout calculations
4. Multi-tier commission structure
5. Affiliate referral tracking (affiliates referring other affiliates)
6. Analytics and reporting dashboard
