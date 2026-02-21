## Plan: Agile Nexus Website Revamp (Phased)

Phased rollout is approved to reduce risk and keep releases testable. Phase 1 focuses on homepage booking, top phone visibility, header/footer social/settings, and section sequencing. Later phases cover Services/About/Resources/Specialities/Affiliate/Careers/Contact structure and CMS-backed content. Multi-service booking is approved with a relational model, and WhatsApp/chatbot are approved as System Settings fields in DB + Admin panel. External-site reference content will be represented as CMS placeholders/structure first.

**Approval Status**
- ✅ Approved: Phased rollout
- ✅ Approved: Relational multi-service booking (`bookings` + `booking_services`)
- ✅ Approved: WhatsApp + chatbot in system settings (DB/admin/API/frontend)
- ✅ Approved: Certifications in footer via existing media `position=certifications` (image only)
- ✅ Approved: X replacement in backend/admin labeling and frontend icon usage
- ✅ Approved: Placeholder/structure-first approach for referenced external pages
- ⏳ Pending content: Final exact copy for About/Services/Resources/Careers/Contact paragraphs

**Steps**
1. Phase 1: Homepage booking updates in [components/sections/home1/About.tsx](components/sections/home1/About.tsx) and [src/app/api/bookings/route.ts](src/app/api/bookings/route.ts): auto-fill today’s date, enable multi-select services, update payload handling.
2. Phase 1: Booking schema extension in [database/bookings-schema.sql](database/bookings-schema.sql) with `booking_services` join model; align admin list/details in [src/app/admin/bookings/page.tsx](src/app/admin/bookings/page.tsx).
3. Phase 1: Header/footer/settings updates in [components/layout/header/Header1.tsx](components/layout/header/Header1.tsx), [components/layout/footer/Footer1.tsx](components/layout/footer/Footer1.tsx), [src/app/admin/settings/page.tsx](src/app/admin/settings/page.tsx), [src/app/api/admin/settings/route.ts](src/app/api/admin/settings/route.ts), [src/app/api/settings/route.ts](src/app/api/settings/route.ts), [database/system-settings-schema.sql](database/system-settings-schema.sql).
4. Phase 1: Home sequence/order and section-level visual fixes in [src/app/page.tsx](src/app/page.tsx), [components/sections/home1/Testimonial.tsx](components/sections/home1/Testimonial.tsx), [public/assets/css/module-css/testimonial.css](public/assets/css/module-css/testimonial.css), and service/specialities blocks.
5. Phase 2: Services architecture/content grouping and backend detail completeness in [src/app/services/page.tsx](src/app/services/page.tsx), [src/app/services/[slug]/page.tsx](src/app/services/[slug]/page.tsx), [src/app/admin/services/page.tsx](src/app/admin/services/page.tsx), [seed-services.ts](seed-services.ts).
6. Phase 2: About + Team structured sections in [src/app/about/page.tsx](src/app/about/page.tsx) using existing pages CMS APIs.
7. Phase 2: Resources completion by adding [src/app/resources/page.tsx](src/app/resources/page.tsx) and specialities details page route with CMS-backed content.
8. Phase 3: Affiliate visuals, careers motivation/opportunities, contact intro lines, WhatsApp direct action, chatbot entry point in [src/app/affiliate-program/page.tsx](src/app/affiliate-program/page.tsx), [src/app/careers/page.tsx](src/app/careers/page.tsx), [src/app/contact/page.tsx](src/app/contact/page.tsx).
9. Final pass: CMS/admin data validation and release QA across all touched modules.

**Add Items (Change Requests)**
- [ ] Add exact external content copy migration from reference websites
- [ ] Add backend-controlled slider timing settings for home services/blog sections
- [ ] Add dedicated “Specialities” navigation item under Resources if required

**Remove Items (De-scoping Candidates)**
- [ ] Remove legacy Twitter field naming in DB (defer until full migration approved)
- [ ] Remove duplicate/unused home imports/components in [src/app/page.tsx](src/app/page.tsx) after stabilization
- [ ] Remove static footer services list if fully CMS-driven footer links are approved

**Verification**
- Run `npm run lint`
- Run `npm run build:no-turbo`
- Verify booking create/read flow with multi-service selection
- Verify admin editability for settings/pages/services/media
- Manual regression: home order, top phone, X link, footer certifications, contact/resource routes
