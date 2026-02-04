# Pages CMS Integration Example

This document shows how to integrate the Pages CMS API with existing frontend pages **without changing the design**.

## Example: Integrating with About Page

The existing `/about` page has static content. Here's how to make it dynamic while keeping the exact same design:

### Step 1: Create a Page in Admin Panel

1. Go to `/admin/pages`
2. Create a new page with:
   - **Title**: "About Us"
   - **Slug**: "about"
   - **Template**: "about"
   - **Status**: "published"
   - **Content**: Your HTML content
   - **Sections**: JSON array (see structure below)

### Step 2: Update About Page Component

**File**: `src/app/about/page.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import CountUp from "react-countup";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../../components/layout/Layout";
import Working from "../../../components/sections/home2/Working";
import Clients from "../../../components/sections/home3/Clients";
import Team from "../../../components/sections/home1/Team";
import Cta from "../../../components/sections/home2/Cta";

export default function About_Page() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch page data from API
    fetch('/api/pages/about')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPageData(data.page);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch page:', err);
        setLoading(false);
      });
  }, []);

  // Use dynamic data if available, otherwise use static fallback
  const title = pageData?.sections?.[0]?.title || "Expertise and compassion saved my life";
  const subtitle = pageData?.sections?.[0]?.subtitle || "About the company";
  const content = pageData?.content || "The medical professionals who treated me showed unmatched expertise...";
  const stats = pageData?.sections?.find((s: any) => s.type === 'stats')?.items || [
    { label: "Expert Doctors", value: 180, suffix: "+" },
    { label: "Different Services", value: 12.2, suffix: "+", decimals: 1 },
    { label: "Multi Services", value: 200, suffix: "+" },
    { label: "Awards Win", value: 8 }
  ];

  if (loading) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="About Us">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={3} footerStyle={1} breadcrumbTitle={pageData?.seoTitle || "About Us"}>
        <section className="about-section about-page p_relative pb_50">
          <div className="auto-container">
            <div className="upper-content mb_80">
              <div className="row clearfix">
                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                  <div className="content-block-one">
                    <div className="content-box">
                      <div className="sec-title mb_15">
                        <span className="sub-title mb_5">{subtitle}</span>
                        <h2>{title}</h2>
                      </div>
                      <div className="text-box mb_30 pb_30">
                        <p dangerouslySetInnerHTML={{ __html: content }}></p>
                      </div>
                      {/* Rest of the static design remains the same */}
                      <div className="inner-box">
                        {/* ... existing code ... */}
                      </div>
                    </div>
                  </div>
                </div>
                {/* ... rest of the design ... */}
              </div>
            </div>
          </div>
        </section>

        {/* Stats section with dynamic data */}
        <section className="funfact-section">
          <div className="auto-container">
            <div className="inner-container">
              <div className="row clearfix">
                {stats.map((stat: any, index: number) => (
                  <div key={index} className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                    <div className="funfact-block-two">
                      <div className="inner-box">
                        <div className="icon-box">
                          <i className={`icon-${37 + index}`}></i>
                        </div>
                        <div className="count-outer count-box">
                          <CountUp 
                            end={stat.value} 
                            duration={1.5} 
                            decimals={stat.decimals || 0}
                          />
                          {stat.suffix && <span>{stat.suffix}</span>}
                        </div>
                        <p>{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the sections remain the same */}
        <Working/>
        <Clients/>
        <Team/>
        <Cta/>
      </Layout>
    </div>
  );
}
```

## Section JSON Structure

When creating a page in the admin panel, you can structure sections like this:

```json
[
  {
    "type": "hero",
    "title": "Expertise and compassion saved my life",
    "subtitle": "About the company",
    "image": "https://res.cloudinary.com/.../about-1.jpg",
    "cta": {
      "text": "Learn More",
      "link": "/contact"
    }
  },
  {
    "type": "stats",
    "items": [
      {
        "label": "Expert Doctors",
        "value": 180,
        "suffix": "+",
        "icon": "icon-37"
      },
      {
        "label": "Different Services",
        "value": 12.2,
        "suffix": "+",
        "decimals": 1,
        "icon": "icon-38"
      },
      {
        "label": "Multi Services",
        "value": 200,
        "suffix": "+",
        "icon": "icon-39"
      },
      {
        "label": "Awards Win",
        "value": 8,
        "icon": "icon-40"
      }
    ]
  },
  {
    "type": "content",
    "title": "Our Specialities",
    "items": [
      "Preventive care",
      "Diagnostic testing",
      "Mental health services"
    ]
  },
  {
    "type": "content",
    "title": "Our Vision",
    "items": [
      "To provide accessible and equitable",
      "To use innovative technology",
      "To empower patients"
    ]
  }
]
```

## Key Points

1. **No Design Changes**: The HTML structure, CSS classes, and layout remain exactly the same
2. **API Integration**: Only add `useState`, `useEffect`, and API fetch calls
3. **Fallback Values**: Always provide static fallback values in case API fails
4. **Loading State**: Show a simple loading indicator while fetching
5. **Dynamic Content**: Replace static text with `pageData` values
6. **Sections**: Use the `sections` JSON array to populate dynamic sections

## SEO Integration

The page automatically uses SEO metadata from the CMS:

```tsx
// In your page component
useEffect(() => {
  if (pageData) {
    // Update document title
    document.title = pageData.seoTitle || pageData.title;
    
    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && pageData.seoDescription) {
      metaDescription.setAttribute('content', pageData.seoDescription);
    }
    
    // Update OG image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && pageData.seoImage) {
      ogImage.setAttribute('content', pageData.seoImage);
    }
  }
}, [pageData]);
```

## Version Management

All page updates are automatically versioned. To restore a previous version:

1. Go to `/admin/pages`
2. Click "Versions" on any page
3. Select a version to restore
