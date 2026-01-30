import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Medical Billing Blog Seeders
 * This script seeds medical billing related blog categories and blogs
 * 
 * Usage:
 *   npm run seed:medical-billing
 */

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to get Cloudinary placeholder URL
function getPlaceholderImage(): string {
  return 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
}

async function seedMedicalBillingCategories() {
  console.log('🌱 Seeding medical billing blog categories...');

  // First, create the main parent category
  const parentCategory = {
    name: 'Medical Billing',
    slug: 'medical-billing',
    description: 'Comprehensive guides and resources about medical billing services, processes, and best practices.',
    parent_id: null
  };

  try {
    // Check if parent category already exists
    const { data: existingParent } = await supabaseAdmin
      .from('blog_categories')
      .select('id, slug')
      .eq('slug', parentCategory.slug)
      .single();

    let parentCategoryId: string | null = null;
    
    if (existingParent) {
      console.log('  ⚠️  Parent category already exists, using existing one...');
      parentCategoryId = existingParent.id;
    } else {
      // Insert parent category
      const { data: insertedParent, error: parentError } = await supabaseAdmin
        .from('blog_categories')
        .insert({
          ...parentCategory,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
        .select()
        .single();

      if (parentError) {
        console.error('  ❌ Error seeding parent category:', parentError);
        throw parentError;
      }

      parentCategoryId = insertedParent?.id || null;
      console.log(`  ✅ Parent category created: ${parentCategory.name}`);
    }

    if (!parentCategoryId) {
      throw new Error('Failed to get parent category ID');
    }

    // Now create child categories - all belong to the main parent
    const childCategories = [
      {
        name: 'Billing Services',
        slug: 'billing-services',
        description: 'Information about various medical billing services and solutions.',
        parent_id: parentCategoryId
      },
      {
        name: 'Revenue Cycle Management',
        slug: 'revenue-cycle-management',
        description: 'Articles about revenue cycle management and optimization strategies.',
        parent_id: parentCategoryId
      },
      {
        name: 'Coding & Documentation',
        slug: 'coding-documentation',
        description: 'Medical coding standards, documentation requirements, and best practices.',
        parent_id: parentCategoryId
      },
      {
        name: 'Insurance Claims',
        slug: 'insurance-claims',
        description: 'Guidance on processing, submitting, and managing insurance claims.',
        parent_id: parentCategoryId
      },
      {
        name: 'Compliance & Regulations',
        slug: 'compliance-regulations',
        description: 'HIPAA compliance, healthcare regulations, and legal requirements.',
        parent_id: parentCategoryId
      }
    ];

    // Check existing child categories
    const { data: existingChildren } = await supabaseAdmin
      .from('blog_categories')
      .select('id, slug')
      .in('slug', childCategories.map((c: any) => c.slug));

    const existingChildSlugs = new Set(existingChildren?.map((c: any) => c.slug) || []);

    // Filter out existing child categories and prepare for insertion
    const childrenToInsert = childCategories
      .filter((cat: any) => !existingChildSlugs.has(cat.slug))
      .map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parent_id: cat.parent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      }));

    if (childrenToInsert.length > 0) {
      const { data: insertedChildren, error: childError } = await supabaseAdmin
        .from('blog_categories')
        .insert(childrenToInsert)
        .select();

      if (childError) {
        console.error('  ❌ Error seeding child categories:', childError);
        throw childError;
      }

      console.log(`  ✅ ${insertedChildren?.length || 0} child category/categories created`);
    }

    // Get all categories (parent + children) for return
    const allCategorySlugs = [parentCategory.slug, ...childCategories.map((c: any) => c.slug)];
    const { data: allCategories } = await supabaseAdmin
      .from('blog_categories')
      .select('id, slug, name')
      .in('slug', allCategorySlugs);

    console.log(`  ✅ Total ${allCategories?.length || 0} category/categories available (1 parent + ${(allCategories?.length || 1) - 1} children)`);
    return allCategories || [];
  } catch (error: any) {
    console.error('  ❌ Error seeding medical billing categories:', error.message);
    throw error;
  }
}

async function seedMedicalBillingBlogs(categories: any[]) {
  console.log('🌱 Seeding medical billing blogs...');

  // Create a map of category slugs to IDs
  const categoryMap = new Map(categories.map((cat: any) => [cat.slug, cat.id]));

  // Get category IDs for child categories
  const billingServicesId = categoryMap.get('billing-services');
  const revenueCycleId = categoryMap.get('revenue-cycle-management');
  const codingDocId = categoryMap.get('coding-documentation');
  const insuranceClaimsId = categoryMap.get('insurance-claims');
  const complianceRegId = categoryMap.get('compliance-regulations');

  const blogs = [
    {
      title: 'Complete Guide to Medical Billing Services',
      slug: 'complete-guide-medical-billing-services',
      category_id: billingServicesId || null, // Use category_id directly
      description: 'A comprehensive guide covering everything you need to know about medical billing services, from basics to advanced strategies.',
      content: `
# Complete Guide to Medical Billing Services

Medical billing is a critical component of healthcare revenue cycle management. This comprehensive guide covers everything you need to know about medical billing services.

## What is Medical Billing?

Medical billing is the process of submitting and following up on claims with health insurance companies to receive payment for services rendered by healthcare providers. It involves translating healthcare services into billing claims.

## Key Components of Medical Billing

### 1. Patient Registration
- Collecting patient demographics
- Verifying insurance information
- Obtaining necessary authorizations

### 2. Charge Entry
- Recording services provided
- Assigning appropriate codes
- Ensuring accuracy of charges

### 3. Claim Submission
- Preparing claims according to payer requirements
- Submitting claims electronically or via paper
- Tracking submission status

### 4. Payment Posting
- Recording payments received
- Applying adjustments
- Reconciling accounts

### 5. Denial Management
- Identifying denied claims
- Investigating denial reasons
- Resubmitting corrected claims

## Benefits of Professional Medical Billing Services

- **Increased Revenue**: Professional billers maximize claim acceptance rates
- **Reduced Errors**: Experienced staff minimize coding and submission errors
- **Faster Payments**: Efficient processes accelerate payment cycles
- **Compliance**: Ensures adherence to healthcare regulations
- **Focus on Patient Care**: Allows providers to focus on clinical work

## Choosing the Right Medical Billing Service

When selecting a medical billing service provider, consider:
- Experience in your specialty
- Technology and software capabilities
- Compliance track record
- Pricing structure
- Customer support quality

## Conclusion

Effective medical billing is essential for healthcare practice success. Partnering with a professional billing service can significantly improve revenue cycle performance and allow healthcare providers to focus on patient care.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'Complete Guide to Medical Billing Services | Healthcare Revenue Management',
      seo_content: 'Learn everything about medical billing services, revenue cycle management, and how to optimize your healthcare practice billing processes.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Understanding Revenue Cycle Management in Healthcare',
      slug: 'understanding-revenue-cycle-management-healthcare',
      category_id: revenueCycleId || null, // Use category_id directly
      description: 'Learn how revenue cycle management works and how it impacts your healthcare practice\'s financial health.',
      content: `
# Understanding Revenue Cycle Management in Healthcare

Revenue Cycle Management (RCM) is the financial process that healthcare facilities use to track patient care episodes from registration and appointment scheduling to the final payment of a balance.

## What is Revenue Cycle Management?

RCM encompasses all administrative and clinical functions that contribute to the capture, management, and collection of patient service revenue. It's a comprehensive approach to managing the entire lifecycle of a patient account.

## The Revenue Cycle Stages

### 1. Pre-Service
- Patient scheduling
- Insurance verification
- Pre-authorization
- Eligibility checks

### 2. Point of Service
- Patient check-in
- Copay collection
- Service documentation
- Charge capture

### 3. Post-Service
- Coding and documentation
- Claim submission
- Payment posting
- Denial management

### 4. Follow-Up
- Patient billing
- Collections
- Account resolution
- Reporting and analytics

## Key Performance Indicators (KPIs)

Monitor these metrics to assess RCM performance:
- Days in Accounts Receivable (AR)
- Clean claim rate
- Denial rate
- Collection rate
- First-pass resolution rate

## Best Practices for RCM

1. **Automate Processes**: Use technology to reduce manual errors
2. **Train Staff**: Ensure all team members understand RCM processes
3. **Monitor Metrics**: Regularly review KPIs and adjust strategies
4. **Optimize Workflows**: Streamline processes for efficiency
5. **Stay Compliant**: Maintain adherence to regulations

## Technology in RCM

Modern RCM relies on:
- Electronic Health Records (EHR)
- Practice Management Systems
- Claims clearinghouses
- Analytics and reporting tools
- Patient portals

## Conclusion

Effective revenue cycle management is crucial for healthcare practice sustainability. By understanding and optimizing each stage of the revenue cycle, practices can improve financial performance and patient satisfaction.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'Revenue Cycle Management Guide | Healthcare Financial Management',
      seo_content: 'Comprehensive guide to revenue cycle management in healthcare, including best practices, KPIs, and optimization strategies.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Medical Coding Best Practices for Accurate Billing',
      slug: 'medical-coding-best-practices-accurate-billing',
      category_id: codingDocId || null, // Use category_id directly
      description: 'Essential medical coding practices to ensure accurate billing and maximize reimbursement rates.',
      content: `
# Medical Coding Best Practices for Accurate Billing

Medical coding is the transformation of healthcare diagnoses, procedures, medical services, and equipment into universal medical alphanumeric codes. Accurate coding is essential for proper billing and reimbursement.

## Importance of Accurate Medical Coding

- Ensures proper reimbursement
- Prevents claim denials
- Maintains compliance
- Supports quality reporting
- Enables data analytics

## Common Coding Systems

### ICD-10-CM (Diagnosis Codes)
International Classification of Diseases, 10th Revision, Clinical Modification codes describe patient diagnoses.

### CPT (Procedure Codes)
Current Procedural Terminology codes describe medical, surgical, and diagnostic services.

### HCPCS (Supply Codes)
Healthcare Common Procedure Coding System codes describe supplies, equipment, and services not included in CPT.

## Best Practices for Medical Coding

### 1. Stay Updated
- Regularly review coding updates
- Attend continuing education
- Subscribe to coding resources
- Participate in professional organizations

### 2. Document Thoroughly
- Ensure complete documentation
- Link diagnoses to procedures
- Include all relevant details
- Maintain clear records

### 3. Use Specific Codes
- Select the most specific code available
- Avoid unspecified codes when possible
- Include all applicable codes
- Consider code sequencing

### 4. Verify Codes
- Double-check code selection
- Use coding software tools
- Consult coding guidelines
- Review before submission

### 5. Monitor Denials
- Track coding-related denials
- Analyze denial patterns
- Implement corrective actions
- Educate staff on issues

## Common Coding Errors to Avoid

- Using outdated codes
- Incorrect code selection
- Missing required codes
- Improper code sequencing
- Incomplete documentation

## Coding Compliance

Ensure compliance by:
- Following official guidelines
- Maintaining certifications
- Conducting regular audits
- Training staff regularly
- Documenting processes

## Technology in Coding

Modern coding tools include:
- Encoder software
- Computer-assisted coding
- Natural language processing
- Integration with EHR systems
- Automated code validation

## Conclusion

Accurate medical coding is fundamental to successful healthcare billing. By following best practices and staying current with coding standards, practices can improve reimbursement rates and maintain compliance.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'Medical Coding Best Practices | Accurate Healthcare Billing',
      seo_content: 'Learn essential medical coding best practices to ensure accurate billing, maximize reimbursement, and maintain compliance.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'How to Handle Insurance Claim Denials Effectively',
      slug: 'handle-insurance-claim-denials-effectively',
      category_id: insuranceClaimsId || null, // Use category_id directly
      description: 'Strategies and best practices for managing and reducing insurance claim denials in your medical practice.',
      content: `
# How to Handle Insurance Claim Denials Effectively

Claim denials are a significant challenge in medical billing. Understanding how to prevent, identify, and resolve denials is crucial for maintaining practice revenue.

## Understanding Claim Denials

A claim denial occurs when an insurance payer refuses to pay for a submitted claim. Denials can be temporary (requiring correction) or permanent (not eligible for payment).

## Common Reasons for Claim Denials

### Administrative Errors
- Missing or incorrect patient information
- Invalid insurance ID numbers
- Duplicate claims
- Timely filing issues

### Clinical Issues
- Lack of medical necessity
- Missing or incomplete documentation
- Coding errors
- Prior authorization issues

### Coverage Problems
- Services not covered by plan
- Out-of-network providers
- Benefit limitations
- Coordination of benefits

## Prevention Strategies

### 1. Verify Eligibility
- Check insurance coverage before service
- Verify patient benefits
- Confirm authorization requirements
- Update information regularly

### 2. Ensure Complete Documentation
- Document all services provided
- Include necessary clinical details
- Link diagnoses to procedures
- Maintain clear records

### 3. Submit Accurate Claims
- Use correct codes
- Include all required information
- Follow payer-specific guidelines
- Review before submission

### 4. Monitor Submission Timelines
- Submit claims promptly
- Track filing deadlines
- Monitor submission status
- Follow up on pending claims

## Denial Management Process

### 1. Identify Denials
- Monitor denial reports
- Track denial patterns
- Categorize by reason
- Prioritize high-value denials

### 2. Investigate Causes
- Review denial reasons
- Examine original claims
- Check documentation
- Identify root causes

### 3. Take Corrective Action
- Correct errors
- Gather additional information
- Prepare appeals
- Resubmit claims

### 4. Track Results
- Monitor appeal success rates
- Analyze trends
- Adjust processes
- Report findings

## Appeal Process

When appealing denials:
- Act quickly on appeal deadlines
- Gather supporting documentation
- Write clear, concise appeals
- Follow payer-specific procedures
- Track appeal status

## Technology Solutions

Modern denial management tools:
- Automated denial tracking
- Predictive analytics
- Workflow management
- Reporting dashboards
- Integration with billing systems

## Best Practices

1. **Proactive Prevention**: Focus on preventing denials before they occur
2. **Quick Response**: Address denials promptly
3. **Data Analysis**: Use denial data to improve processes
4. **Staff Training**: Educate team on common issues
5. **Continuous Improvement**: Regularly review and optimize processes

## Conclusion

Effective denial management requires a proactive approach focusing on prevention, quick resolution, and continuous improvement. By implementing these strategies, practices can significantly reduce denial rates and improve revenue.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'Insurance Claim Denial Management | Healthcare Billing Solutions',
      seo_content: 'Learn effective strategies for handling insurance claim denials, reducing denial rates, and improving healthcare practice revenue.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'HIPAA Compliance in Medical Billing: Essential Guidelines',
      slug: 'hipaa-compliance-medical-billing-essential-guidelines',
      category_id: complianceRegId || null, // Use category_id directly
      description: 'Critical HIPAA compliance requirements and best practices for medical billing operations.',
      content: `
# HIPAA Compliance in Medical Billing: Essential Guidelines

The Health Insurance Portability and Accountability Act (HIPAA) sets standards for protecting sensitive patient health information. Medical billing operations must comply with HIPAA regulations.

## What is HIPAA?

HIPAA is a federal law that requires the creation of national standards to protect sensitive patient health information from being disclosed without the patient's consent or knowledge.

## Key HIPAA Components

### Privacy Rule
Establishes standards for protecting individuals' medical records and other personal health information.

### Security Rule
Sets standards for protecting electronic protected health information (ePHI).

### Breach Notification Rule
Requires covered entities to notify affected individuals and HHS of breaches of unsecured PHI.

## Protected Health Information (PHI)

PHI includes any information that can identify a patient:
- Names and addresses
- Social Security numbers
- Medical record numbers
- Health conditions
- Treatment information
- Billing information

## HIPAA Compliance Requirements for Billing

### 1. Administrative Safeguards
- Designate a privacy officer
- Implement workforce training
- Establish access controls
- Develop contingency plans
- Conduct risk assessments

### 2. Physical Safeguards
- Control facility access
- Secure workstations
- Protect electronic media
- Implement device controls
- Maintain secure disposal

### 3. Technical Safeguards
- Access controls
- Audit controls
- Integrity controls
- Transmission security
- Encryption requirements

## Best Practices for HIPAA Compliance

### Staff Training
- Regular HIPAA training sessions
- Role-based access education
- Incident reporting procedures
- Ongoing compliance updates

### Access Controls
- Implement least privilege access
- Use unique user IDs
- Enable automatic logoff
- Monitor access logs
- Review access regularly

### Data Security
- Encrypt sensitive data
- Secure data transmission
- Implement backup procedures
- Use secure storage
- Regular security updates

### Business Associate Agreements
- Execute BAAs with vendors
- Monitor vendor compliance
- Include breach notification terms
- Regular compliance reviews

## Common HIPAA Violations

- Unauthorized access to PHI
- Improper disposal of PHI
- Lack of encryption
- Missing business associate agreements
- Insufficient staff training

## Penalties for Non-Compliance

HIPAA violations can result in:
- Civil penalties: $100 to $50,000 per violation
- Criminal penalties: Up to $250,000 and 10 years imprisonment
- Reputation damage
- Loss of patient trust

## Compliance Checklist

- [ ] Designated privacy officer
- [ ] Written policies and procedures
- [ ] Staff training program
- [ ] Risk assessment completed
- [ ] Business associate agreements
- [ ] Access controls implemented
- [ ] Encryption in place
- [ ] Incident response plan
- [ ] Regular compliance audits
- [ ] Documentation maintained

## Conclusion

HIPAA compliance is not optional—it's a legal requirement. Medical billing operations must implement comprehensive safeguards to protect patient information and avoid costly violations.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'HIPAA Compliance Medical Billing | Healthcare Privacy Guidelines',
      seo_content: 'Essential HIPAA compliance guidelines for medical billing operations, including security safeguards and best practices.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Outsourcing Medical Billing: Pros, Cons, and Best Practices',
      slug: 'outsourcing-medical-billing-pros-cons-best-practices',
      category_id: billingServicesId || null, // Use category_id directly
      description: 'Comprehensive analysis of outsourcing medical billing services, including benefits, challenges, and selection criteria.',
      content: `
# Outsourcing Medical Billing: Pros, Cons, and Best Practices

Many healthcare practices consider outsourcing medical billing to improve efficiency and reduce costs. This guide explores the advantages, disadvantages, and best practices.

## What is Outsourced Medical Billing?

Outsourced medical billing involves hiring a third-party company to handle all or part of your practice's billing and revenue cycle management processes.

## Advantages of Outsourcing

### Cost Savings
- Reduced staffing costs
- No need for billing software licenses
- Lower overhead expenses
- Predictable monthly fees

### Expertise
- Specialized billing knowledge
- Experience with multiple payers
- Up-to-date on regulations
- Advanced technology access

### Focus on Patient Care
- More time for clinical work
- Reduced administrative burden
- Less staff management
- Improved work-life balance

### Technology Benefits
- Access to advanced systems
- Automated processes
- Better reporting and analytics
- Integration capabilities

## Disadvantages of Outsourcing

### Less Control
- Reduced oversight of processes
- Dependency on vendor
- Communication challenges
- Potential service quality issues

### Cost Considerations
- Monthly service fees
- Percentage of collections
- Hidden costs
- Long-term contracts

### Security Concerns
- PHI sharing with third parties
- Data breach risks
- Compliance requirements
- Vendor reliability

### Integration Challenges
- System compatibility
- Data transfer issues
- Workflow adjustments
- Training requirements

## When to Consider Outsourcing

Outsourcing may be beneficial when:
- Billing is taking too much time
- Denial rates are high
- Staff lacks expertise
- Technology is outdated
- Costs are increasing
- Growth is challenging

## Choosing a Billing Service Provider

### Key Selection Criteria

1. **Experience and Reputation**
   - Years in business
   - Client references
   - Industry recognition
   - Track record

2. **Technology and Systems**
   - Modern software platforms
   - Integration capabilities
   - Security measures
   - Reporting tools

3. **Compliance and Security**
   - HIPAA compliance
   - Security certifications
   - Data protection measures
   - Insurance coverage

4. **Service Quality**
   - Response times
   - Communication methods
   - Support availability
   - Performance metrics

5. **Pricing Structure**
   - Transparent fees
   - No hidden costs
   - Flexible contracts
   - Value for money

## Best Practices for Outsourcing

### 1. Define Expectations
- Set clear performance metrics
- Establish communication protocols
- Define reporting requirements
- Outline service level agreements

### 2. Maintain Oversight
- Regular performance reviews
- Monitor key metrics
- Review reports regularly
- Conduct periodic audits

### 3. Ensure Compliance
- Verify HIPAA compliance
- Review security measures
- Execute business associate agreements
- Monitor compliance status

### 4. Foster Communication
- Regular check-in meetings
- Open communication channels
- Address issues promptly
- Provide feedback

### 5. Plan for Transition
- Develop transition timeline
- Train staff on new processes
- Test systems thoroughly
- Monitor initial performance

## Transition Process

1. **Preparation Phase**
   - Assess current processes
   - Identify requirements
   - Select vendor
   - Plan transition

2. **Implementation Phase**
   - System integration
   - Data migration
   - Staff training
   - Process adjustments

3. **Optimization Phase**
   - Monitor performance
   - Address issues
   - Refine processes
   - Measure results

## Conclusion

Outsourcing medical billing can be an effective strategy for many practices, but it requires careful consideration and management. By following best practices and choosing the right partner, practices can achieve improved efficiency and financial performance.
      `.trim(),
      file: getPlaceholderImage(),
      seo_title: 'Outsourcing Medical Billing | Healthcare Revenue Management',
      seo_content: 'Complete guide to outsourcing medical billing services, including benefits, challenges, selection criteria, and best practices.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  try {
    // Check if blogs already exist
    const { data: existing } = await supabaseAdmin
      .from('blogs')
      .select('slug')
      .in('slug', blogs.map((b: any) => b.slug));

    if (existing && existing.length > 0) {
      console.log('  ⚠️  Some blogs already exist, skipping...');
      return;
    }

    // Blogs already have category_id, just prepare for insertion
    const blogsToInsert = blogs.map((blog: any) => ({
      ...blog,
      deleted_at: null
    }));

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .insert(blogsToInsert)
      .select();

    if (error) {
      // If category_id field doesn't exist, try without it
      if (error.message.includes('column') && error.message.includes('category_id')) {
        console.log('  ⚠️  category_id column not found in blogs table. Inserting without category_id...');
        
        const blogsWithoutCategory = blogsToInsert.map(({ category_id, ...blog }: any) => blog);
        
        const { data: dataWithoutCategory, error: errorWithoutCategory } = await supabaseAdmin
          .from('blogs')
          .insert(blogsWithoutCategory)
          .select();

        if (errorWithoutCategory) {
          console.error('  ❌ Error seeding blogs:', errorWithoutCategory);
          throw errorWithoutCategory;
        }

        console.log(`  ✅ ${dataWithoutCategory?.length || 0} blog(s) seeded successfully (without category_id)!`);
        console.log('  💡 Tip: Add category_id column to blogs table to link blogs to categories');
        return;
      }
      
      console.error('  ❌ Error seeding blogs:', error);
      throw error;
    }

    console.log(`  ✅ ${data?.length || 0} blog(s) seeded successfully with categories!`);
  } catch (error: any) {
    console.error('  ❌ Error seeding medical billing blogs:', error.message);
    throw error;
  }
}

async function seedMedicalBilling() {
  console.log('\n🚀 Starting medical billing seeders...\n');

  try {
    // First seed categories
    const categories = await seedMedicalBillingCategories();
    
    // Then seed blogs
    await seedMedicalBillingBlogs(categories || []);

    console.log('\n✅ Medical billing seeders completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Medical billing seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
seedMedicalBilling();
