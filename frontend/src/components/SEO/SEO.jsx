import { useEffect } from 'react';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  structuredData,
  noindex = false,
  nofollow = false,
  canonical,
  alternateLanguages = {}
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Update keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Update robots meta
    const robots = noindex || nofollow ? 
      `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}` : 
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', robots);

    // Update Open Graph tags
    const defaultImage = 'https://ik.imagekit.io/vedarc/Vedarc/vedarc-meta-banner.png?updatedAt=1751480791031';
    const defaultUrl = 'https://www.vedarc.co.in';
    const defaultSiteName = 'VEDARC Technologies Private Limited';

    const ogTags = {
      'og:title': title || 'ProX AI by Vedarc Technologies',
      'og:description': description,
      'og:image': image || defaultImage,
      'og:url': url || defaultUrl,
      'og:type': type,
      'og:site_name': defaultSiteName,
      'og:locale': 'en_US'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        let ogTag = document.querySelector(`meta[property="${property}"]`);
        if (!ogTag) {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', property);
          document.head.appendChild(ogTag);
        }
        ogTag.setAttribute('content', content);
      }
    });

    // Update Twitter tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title || 'ProX AI by Vedarc Technologies',
      'twitter:description': description,
      'twitter:image': image || defaultImage,
      'twitter:site': '@vedarc_tech',
      'twitter:creator': '@vedarc_tech'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        let twitterTag = document.querySelector(`meta[name="${name}"]`);
        if (!twitterTag) {
          twitterTag = document.createElement('meta');
          twitterTag.setAttribute('name', name);
          document.head.appendChild(twitterTag);
        }
        twitterTag.setAttribute('content', content);
      }
    });

    // Add structured data
    if (structuredData) {
      let existingScript = document.querySelector('script[data-seo-structured-data]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Add alternate language links
    Object.entries(alternateLanguages).forEach(([lang, url]) => {
      let alternateLink = document.querySelector(`link[hreflang="${lang}"]`);
      if (!alternateLink) {
        alternateLink = document.createElement('link');
        alternateLink.rel = 'alternate';
        alternateLink.hreflang = lang;
        document.head.appendChild(alternateLink);
      }
      alternateLink.href = url;
    });

  }, [title, description, keywords, canonical, noindex, nofollow, image, url, type, structuredData, alternateLanguages]);

  // This component doesn't render anything visible
  return null;
};

export default SEO; 