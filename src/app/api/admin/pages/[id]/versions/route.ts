import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/pages/[id]/versions
// Get all versions of a page
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data: versions, error } = await supabaseAdmin
      .from('page_versions')
      .select('*')
      .eq('page_id', id)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch versions' },
        { status: 500 }
      );
    }

    const mappedVersions = (versions || []).map((version: any) => ({
      _id: version.id,
      pageId: version.page_id,
      versionNumber: version.version_number,
      title: version.title,
      slug: version.slug,
      content: version.content,
      sections: version.sections || [],
      seoTitle: version.seo_title,
      seoDescription: version.seo_description,
      seoKeywords: version.seo_keywords,
      seoImage: version.seo_image,
      status: version.status,
      template: version.template,
      changeNote: version.change_note,
      createdBy: version.created_by,
      created_at: version.created_at
    }));

    return NextResponse.json({
      success: true,
      versions: mappedVersions
    });
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages/[id]/versions
// Restore a specific version
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { success: false, message: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabaseAdmin
      .from('page_versions')
      .select('*')
      .eq('id', versionId)
      .eq('page_id', id)
      .single();

    if (versionError || !version) {
      return NextResponse.json(
        { success: false, message: 'Version not found' },
        { status: 404 }
      );
    }

    // Restore the version to the main page
    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .update({
        title: version.title,
        slug: version.slug,
        content: version.content,
        sections: version.sections,
        seo_title: version.seo_title,
        seo_description: version.seo_description,
        seo_keywords: version.seo_keywords,
        seo_image: version.seo_image,
        status: version.status,
        template: version.template,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to restore version' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Version restored successfully',
      page: {
        _id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        sections: page.sections || [],
        seoTitle: page.seo_title,
        seoDescription: page.seo_description,
        seoKeywords: page.seo_keywords,
        seoImage: page.seo_image,
        status: page.status,
        template: page.template,
        publishedAt: page.published_at,
        created_at: page.created_at,
        updated_at: page.updated_at
      }
    });
  } catch (error) {
    console.error('Restore version error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to restore version' },
      { status: 500 }
    );
  }
}
