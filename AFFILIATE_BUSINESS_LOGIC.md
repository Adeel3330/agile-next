# Affiliate Program - Business Logic Explanation

## Core Business Rules

### 1. Application Fee Structure
```
Individual Provider → $0.00 (Free application)
Medical Group      → $50.00 per application
```

**Implementation:**
- Fee is automatically calculated when application is created
- Stored in `affiliate_applications.application_fee`
- Can be recalculated if provider type changes

### 2. Affiliate Status Management

**Status Flow:**
```
pending → active → inactive/blocked
```

**Rules:**
- Only `active` affiliates can receive leads/applications
- Public APIs check affiliate status before processing
- Blocked affiliates cannot generate new leads

### 3. Lead Attribution System

**How it Works:**
1. Affiliate shares link with unique `affiliate_code`
2. Lead visits link → tracked via `/api/affiliate/lead`
3. Lead converts → application created via `/api/affiliate/apply`
4. Lead record updated with `converted = true` and `application_id`

**Tracking Data Captured:**
- IP Address (for fraud prevention)
- User Agent (browser/device info)
- Referrer URL (where they came from)
- Source (landing page, form, etc.)
- Timestamp

### 4. Commission Calculation

**Formula:**
```
Commission = Application Fee × Commission Rate
Example: $50.00 × 10% = $5.00 per application
```

**Default Rate:** 10%
**Customizable:** Per affiliate in `affiliates.commission_rate`

### 5. Payout Management

**Payout Status:**
- `pending` - Created, awaiting processing
- `processing` - Payment being processed
- `paid` - Payment completed (includes `paid_at` timestamp)
- `cancelled` - Payout cancelled

**Payout Period:**
- Tracks `period_start` and `period_end` dates
- Allows monthly/quarterly/annual payouts
- Can filter payouts by date range

## API Workflow Examples

### Scenario 1: New Affiliate Application
```
1. Admin creates affiliate → POST /api/admin/affiliates
   - Status: "pending"
   - Auto-generates affiliate_code (e.g., "AFF-ABC12345")

2. Admin approves affiliate → PUT /api/admin/affiliates/[id]
   - Status: "active"
   - Affiliate can now receive leads
```

### Scenario 2: Lead Generation & Conversion
```
1. Affiliate shares link: https://yoursite.com/apply?ref=AFF-ABC12345

2. Visitor clicks link → Frontend calls:
   POST /api/affiliate/lead
   {
     "affiliateCode": "AFF-ABC12345",
     "source": "landing_page"
   }
   → Creates lead record (converted: false)

3. Visitor submits application → Frontend calls:
   POST /api/affiliate/apply
   {
     "affiliateCode": "AFF-ABC12345",
     "name": "Dr. Smith",
     "email": "smith@clinic.com",
     "phone": "555-1234",
     "providerType": "group"
   }
   → Creates application (fee: $50.00)
   → Updates lead record (converted: true, application_id linked)
```

### Scenario 3: Admin Processing
```
1. Admin reviews application → GET /api/admin/affiliate-applications/[id]

2. Admin approves → PUT /api/admin/affiliate-applications/[id]
   {
     "status": "approved"
   }

3. Admin creates payout → POST /api/admin/payouts
   {
     "affiliateId": "uuid",
     "amount": 500.00,
     "periodStart": "2024-01-01",
     "periodEnd": "2024-01-31",
     "status": "paid"
   }
```

## Data Relationships

```
affiliates (1) ──→ (many) affiliate_applications
affiliates (1) ──→ (many) affiliate_leads
affiliates (1) ──→ (many) payouts

affiliate_leads (many) ──→ (1) affiliate_applications
  (when converted = true)
```

## Security Features

1. **JWT Protection** - All admin routes require authentication
2. **Status Validation** - Only active affiliates can receive leads
3. **Input Sanitization** - All user inputs are validated and trimmed
4. **Email Uniqueness** - Prevents duplicate affiliate emails
5. **Soft Deletes** - Data preserved with `deleted_at` timestamp

## CSV Export Format

Exported columns:
- ID, Date, Affiliate Name, Affiliate Code
- Lead Name, Email, Phone, Source
- IP Address, Converted Status, Application ID, Notes

**Usage:**
```
GET /api/admin/affiliate-leads/export?affiliate_id=xxx&converted=true
→ Downloads CSV file
```

## Error Handling

All APIs return consistent error format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- Invalid affiliate code
- Affiliate not active
- Missing required fields
- Duplicate email addresses
- Invalid provider type

## Performance Optimizations

1. **Database Indexes** - On frequently queried fields:
   - affiliate_code
   - status fields
   - created_at (for date range queries)
   - foreign keys

2. **Pagination** - All list endpoints support pagination
3. **Selective Queries** - Only fetch needed fields
4. **Soft Deletes** - Filter out deleted records automatically

## Integration Points

### Frontend Integration
- Use affiliate code from URL params (`?ref=AFF-CODE`)
- Call `/api/affiliate/lead` on page load
- Call `/api/affiliate/apply` on form submission
- Display application fee before submission

### Admin Panel Integration
- List pages with search/filter/pagination
- Detail pages with edit forms
- Status change actions (approve/reject/block)
- CSV export buttons
- Payout creation forms

## Testing Scenarios

1. **Individual Provider Application**
   - Should have $0.00 fee
   - Should create application and lead record

2. **Medical Group Application**
   - Should have $50.00 fee
   - Should create application and lead record

3. **Invalid Affiliate Code**
   - Should return 400 error
   - Should not create records

4. **Inactive Affiliate**
   - Should return 400 error
   - Should not accept leads/applications

5. **Lead Conversion**
   - Lead should link to application
   - converted flag should be true
