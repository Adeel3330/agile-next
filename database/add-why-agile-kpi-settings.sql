-- Add default Why Agile KPI values into settings.additional_settings for existing environments
-- Safe to run multiple times

UPDATE settings
SET additional_settings =
  COALESCE(additional_settings, '{}'::jsonb) ||
  jsonb_build_object(
    'whyAgileKpis', jsonb_build_array(
      jsonb_build_object('value', '30%', 'label', 'Reduction in A/R'),
      jsonb_build_object('value', '7–14', 'label', 'Days Turnaround Time'),
      jsonb_build_object('value', '95%', 'label', 'First Pass Clean Claims Rate'),
      jsonb_build_object('value', 'Up to 30%', 'label', 'Revenue Increase'),
      jsonb_build_object('value', '90%', 'label', 'Collection Ratio'),
      jsonb_build_object('value', '40+', 'label', 'Specialties')
    ),
    'whyAgileKpi1Value', COALESCE(additional_settings->>'whyAgileKpi1Value', '30%'),
    'whyAgileKpi1Label', COALESCE(additional_settings->>'whyAgileKpi1Label', 'Reduction in A/R'),
    'whyAgileKpi2Value', COALESCE(additional_settings->>'whyAgileKpi2Value', '7–14'),
    'whyAgileKpi2Label', COALESCE(additional_settings->>'whyAgileKpi2Label', 'Days Turnaround Time'),
    'whyAgileKpi3Value', COALESCE(additional_settings->>'whyAgileKpi3Value', '95%'),
    'whyAgileKpi3Label', COALESCE(additional_settings->>'whyAgileKpi3Label', 'First Pass Clean Claims Rate'),
    'whyAgileKpi4Value', COALESCE(additional_settings->>'whyAgileKpi4Value', 'Up to 30%'),
    'whyAgileKpi4Label', COALESCE(additional_settings->>'whyAgileKpi4Label', 'Revenue Increase'),
    'whyAgileKpi5Value', COALESCE(additional_settings->>'whyAgileKpi5Value', '90%'),
    'whyAgileKpi5Label', COALESCE(additional_settings->>'whyAgileKpi5Label', 'Collection Ratio'),
    'whyAgileKpi6Value', COALESCE(additional_settings->>'whyAgileKpi6Value', '40+'),
    'whyAgileKpi6Label', COALESCE(additional_settings->>'whyAgileKpi6Label', 'Specialties')
  ),
  updated_at = NOW();
