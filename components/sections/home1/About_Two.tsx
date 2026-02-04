"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface TabItem {
  id: number;
  title: string;
}

interface TabContentItem {
  id: number;
  heading: string;
  paragraph: string;
  leftListTitle: string;
  leftList: string[];
  rightListTitle: string;
  rightList: string[];
}

interface AboutData {
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  sections?: any[];
}

export default function About_Two() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [tabContent, setTabContent] = useState<TabContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
    fetchAboutData();
  }, []);

  useEffect(() => {
    if (tabs.length > 0 && activeTab === 1) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      // Fetch data from About Us page
      const response = await fetch('/api/pages?template=about-us');
      const data = await response.json();

      if (data.success && data.page) {
        setAboutData(data.page);
        
        // Get image from page fileUrl or media API
        if (data.page.fileUrl) {
          setAboutImage(data.page.fileUrl);
        } else {
          try {
            const mediaRes = await fetch('/api/media?position=about');
            const mediaData = await mediaRes.json();
            if (mediaData.success && mediaData.media && mediaData.media.length > 0) {
              // Try to get second image for About_Two section
              const secondImage = mediaData.media.length > 1 ? mediaData.media[1] : mediaData.media[0];
              setAboutImage(secondImage.fileUrl);
            }
          } catch (err) {
            console.error('Failed to fetch about media:', err);
          }
        }

        // Parse tabs from sections
        if (data.page.sections && Array.isArray(data.page.sections)) {
          parseTabsFromSections(data.page.sections);
        }
      }
    } catch (err) {
      console.error('Failed to fetch about data:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseTabsFromSections = (sections: any[]) => {
    const tabsData: TabItem[] = [];
    const contentData: TabContentItem[] = [];

    sections.forEach((section: any, sectionIndex: number) => {
      // Handle tabs or chooseus section type
      if (section.type === 'tabs' || section.type === 'chooseus') {
        if (section.tabs && Array.isArray(section.tabs)) {
          section.tabs.forEach((tab: any, tabIndex: number) => {
            const tabId = tabIndex + 1;
            tabsData.push({
              id: tabId,
              title: tab.title || tab.heading || `Tab ${tabId}`
            });
            contentData.push({
              id: tabId,
              heading: tab.heading || tab.title || `Tab ${tabId}`,
              paragraph: tab.text || tab.description || tab.content || '',
              leftListTitle: tab.leftListTitle || 'Our Specialities',
              leftList: tab.leftList || tab.leftItems || [],
              rightListTitle: tab.rightListTitle || tab.title || 'Our Vision',
              rightList: tab.rightList || tab.rightItems || []
            });
          });
        }
      }
      // Handle content array type
      else if (section.type === 'content' && Array.isArray(section.content)) {
        section.content.forEach((contentItem: any, contentIndex: number) => {
          const tabId = contentIndex + 1;
          tabsData.push({
            id: tabId,
            title: contentItem.title || contentItem.heading || `Content ${tabId}`
          });
          contentData.push({
            id: tabId,
            heading: contentItem.heading || contentItem.title || `Content ${tabId}`,
            paragraph: contentItem.text || contentItem.description || contentItem.content || '',
            leftListTitle: contentItem.leftListTitle || 'Our Specialities',
            leftList: contentItem.leftList || contentItem.leftItems || [],
            rightListTitle: contentItem.rightListTitle || contentItem.title || 'Our Vision',
            rightList: contentItem.rightList || contentItem.rightItems || []
          });
        });
      }
    });

    // If no tabs found, use default tabs
    if (tabsData.length === 0) {
      const defaultTabs = [
        { id: 1, title: "Vision" },
        { id: 2, title: "Mission" },
        { id: 3, title: "Strategy" },
      ];
      const defaultContent = [
        {
          id: 1,
          heading: "Vision",
          paragraph: aboutData?.description || "The medical professionals who treated me showed unmatched expertise, compassion, and dedication.",
          leftListTitle: "Our Specialities",
          leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
          rightListTitle: "Our Vision",
          rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
        },
        {
          id: 2,
          heading: "Mission",
          paragraph: aboutData?.description || "The medical professionals who treated me showed unmatched expertise, compassion, and dedication.",
          leftListTitle: "Our Specialities",
          leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
          rightListTitle: "Our Mission",
          rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
        },
        {
          id: 3,
          heading: "Strategy",
          paragraph: aboutData?.description || "The medical professionals who treated me showed unmatched expertise, compassion, and dedication.",
          leftListTitle: "Our Specialities",
          leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
          rightListTitle: "Our Strategy",
          rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
        },
      ];
      setTabs(defaultTabs);
      setTabContent(defaultContent);
    } else {
      setTabs(tabsData);
      setTabContent(contentData);
    }
  };

  if (!mounted) {
    return null;
  }

  // Extract title and description
  const getTitle = () => {
    if (aboutData?.content) {
      const titleMatch = aboutData.content.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (titleMatch) {
        return titleMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    }
    return aboutData?.title || 'Expertise and compassion saved my life';
  };

  const getDescription = () => {
    if (aboutData?.content) {
      const paraMatch = aboutData.content.match(/<p[^>]*>(.*?)<\/p>/i);
      if (paraMatch) {
        return paraMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    }
    return aboutData?.description || 'The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.';
  };

  const title = getTitle();
  const description = getDescription();
  const imageUrl = aboutImage || '/assets/images/resource/about-2.jpg';

  return (
    <section className="about-style-two pt_140">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/assets/images/shape/shape-20.png)" }}
      ></div>
      <div className="auto-container">
        <div className="row clearfix">
          {/* Content Column */}
          <div className="col-lg-6 col-md-12 col-sm-12 content-column">
            <div className="content_block_three">
              <div className="content-box">
                <div className="sec-title mb_15">
                  <span className="sub-title mb_5">About the company</span>
                  {loading ? (
                    <div className="skeleton" style={{ width: '70%', height: '50px', marginBottom: '20px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                  ) : (
                    <h2>{title.split(' ').slice(0, 2).join(' ')} <br />{title.split(' ').slice(2).join(' ')}</h2>
                  )}
                </div>
                <div className="text-box mb_30">
                  {loading ? (
                    <>
                      <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '10px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                      <div className="skeleton" style={{ width: '90%', height: '16px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                    </>
                  ) : (
                    <p>{description}</p>
                  )}
                </div>

                {/* Tabs Buttons */}
                {tabs.length > 0 && (
                  <div className="tabs-box">
                    <div className="tab-btns tab-buttons clearfix mb_30">
                      {loading ? (
                        <>
                          <div className="skeleton" style={{ width: '80px', height: '40px', marginRight: '10px', display: 'inline-block', background: '#e0e0e0', borderRadius: '4px' }}></div>
                          <div className="skeleton" style={{ width: '80px', height: '40px', marginRight: '10px', display: 'inline-block', background: '#e0e0e0', borderRadius: '4px' }}></div>
                          <div className="skeleton" style={{ width: '80px', height: '40px', display: 'inline-block', background: '#e0e0e0', borderRadius: '4px' }}></div>
                        </>
                      ) : (
                        tabs.map(tab => (
                          <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active-btn" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            {tab.title}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Tabs Content */}
                    <div className="tabs-content">
                      {loading ? (
                        <div className="skeleton" style={{ width: '100%', height: '200px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                      ) : (
                        tabContent.map(content => (
                          <div
                            key={content.id}
                            className={`tab ${activeTab === content.id ? "active-tab" : ""}`}
                          >
                            <div className="inner-box">
                              <p>{content.paragraph}</p>
                              <div className="list-inner">
                                <div className="row clearfix">
                                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                    <div className="specialities-box">
                                      <h4>{content.leftListTitle}</h4>
                                      <ul className="list-style-one clearfix">
                                        {content.leftList.map((item, i) => <li key={i}>{item}</li>)}
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                    <div className="specialities-box">
                                      <h4>{content.rightListTitle}</h4>
                                      <ul className="list-style-one clearfix">
                                        {content.rightList.map((item, i) => <li key={i}>{item}</li>)}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="col-lg-6 col-md-12 col-sm-12 image-column">
            <div className="image-box">
              <div
                className="image-shape"
                style={{ backgroundImage: "url(/assets/images/shape/shape-19.png)" }}
              ></div>
              {loading ? (
                <div className="skeleton" style={{ width: '100%', height: '639px', background: '#e0e0e0', borderRadius: '10px' }}></div>
              ) : (
                <figure className="image">
                  <Image 
                    src={getCloudinaryImageUrl(imageUrl)} 
                    alt="About" 
                    width={636} 
                    height={639}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </figure>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}