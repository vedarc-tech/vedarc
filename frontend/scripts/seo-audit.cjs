#!/usr/bin/env node

/**
 * SEO Audit Script for VEDARC Technologies
 * This script performs comprehensive SEO checks and generates reports
 */

const fs = require('fs');
const path = require('path');

// SEO Audit Configuration
const seoConfig = {
  baseUrl: 'https://www.vedarc.co.in',
  pages: [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/use-cases', priority: 0.9, changefreq: 'monthly' },
    { path: '/investors', priority: 0.8, changefreq: 'monthly' },
    { path: '/team', priority: 0.7, changefreq: 'monthly' },
    { path: '/contact', priority: 0.8, changefreq: 'monthly' },
    { path: '/internship-registration', priority: 0.8, changefreq: 'weekly' },
    { path: '/airole-apply', priority: 0.8, changefreq: 'weekly' },
    { path: '/terms-conditions', priority: 0.4, changefreq: 'yearly' },
    { path: '/refund-policy', priority: 0.4, changefreq: 'yearly' },
    { path: '/privacy-policy', priority: 0.4, changefreq: 'yearly' }
  ],
  requiredMetaTags: [
    'description',
    'keywords',
    'robots',
    'viewport',
    'author',
    'language'
  ],
  requiredOpenGraph: [
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'og:site_name'
  ],
  requiredTwitter: [
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image'
  ]
};

// SEO Audit Functions
class SEOAuditor {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
  }

  // Check if file exists
  checkFileExists(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        this.logPass(`${description} exists`);
        return true;
      } else {
        this.logFail(`${description} missing`);
        return false;
      }
    } catch (error) {
      this.logFail(`${description} check failed: ${error.message}`);
      return false;
    }
  }

  // Check sitemap
  checkSitemap() {
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    if (this.checkFileExists(sitemapPath, 'Sitemap.xml')) {
      const content = fs.readFileSync(sitemapPath, 'utf8');
      
      // Check if all pages are included
      seoConfig.pages.forEach(page => {
        if (!content.includes(`<loc>${seoConfig.baseUrl}${page.path}</loc>`)) {
          this.logWarning(`Page ${page.path} not found in sitemap`);
        }
      });

      // Check sitemap structure
      if (!content.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        this.logFail('Sitemap missing XML declaration');
      }
      if (!content.includes('<urlset')) {
        this.logFail('Sitemap missing urlset element');
      }
    }
  }

  // Check robots.txt
  checkRobotsTxt() {
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    if (this.checkFileExists(robotsPath, 'Robots.txt')) {
      const content = fs.readFileSync(robotsPath, 'utf8');
      
      if (!content.includes('Sitemap:')) {
        this.logWarning('Robots.txt missing sitemap reference');
      }
      if (!content.includes('User-agent: *')) {
        this.logWarning('Robots.txt missing user-agent directive');
      }
    }
  }

  // Check HTML head
  checkHtmlHead() {
    const htmlPath = path.join(__dirname, '../index.html');
    if (this.checkFileExists(htmlPath, 'Index.html')) {
      const content = fs.readFileSync(htmlPath, 'utf8');
      
      // Check required meta tags
      seoConfig.requiredMetaTags.forEach(tag => {
        if (!content.includes(`name="${tag}"`) && !content.includes(`name='${tag}'`)) {
          this.logWarning(`Meta tag '${tag}' not found`);
        }
      });

      // Check title tag
      if (!content.includes('<title>')) {
        this.logWarning('Title tag not found');
      }

      // Check Open Graph tags
      seoConfig.requiredOpenGraph.forEach(tag => {
        if (!content.includes(`property="${tag}"`) && !content.includes(`property='${tag}'`)) {
          this.logWarning(`Open Graph tag '${tag}' not found`);
        }
      });

      // Check Twitter tags
      seoConfig.requiredTwitter.forEach(tag => {
        if (!content.includes(`name="${tag}"`) && !content.includes(`name='${tag}'`)) {
          this.logWarning(`Twitter tag '${tag}' not found`);
        }
      });

      // Check structured data
      if (!content.includes('application/ld+json')) {
        this.logWarning('Structured data not found');
      }

      // Check canonical URL
      if (!content.includes('rel="canonical"')) {
        this.logWarning('Canonical URL not found');
      }
    }
  }

  // Check Vite configuration
  checkViteConfig() {
    const vitePath = path.join(__dirname, '../vite.config.js');
    if (this.checkFileExists(vitePath, 'Vite config')) {
      const content = fs.readFileSync(vitePath, 'utf8');
      
      if (!content.includes('manualChunks')) {
        this.logWarning('Manual chunks not configured in Vite');
      }
      if (!content.includes('terser')) {
        this.logWarning('Terser minification not configured');
      }
      if (!content.includes('cssCodeSplit')) {
        this.logWarning('CSS code splitting not enabled');
      }
    }
  }

  // Check Vercel configuration
  checkVercelConfig() {
    const vercelPath = path.join(__dirname, '../vercel.json');
    if (this.checkFileExists(vercelPath, 'Vercel config')) {
      const content = fs.readFileSync(vercelPath, 'utf8');
      
      if (!content.includes('Cache-Control')) {
        this.logWarning('Cache control headers not configured');
      }
      if (!content.includes('X-Content-Type-Options')) {
        this.logWarning('Security headers not configured');
      }
      if (!content.includes('sitemap.xml')) {
        this.logWarning('Sitemap headers not configured');
      }
    }
  }

  // Check SEO component
  checkSEOComponent() {
    const seoPath = path.join(__dirname, '../src/components/SEO/SEO.jsx');
    if (this.checkFileExists(seoPath, 'SEO component')) {
      const content = fs.readFileSync(seoPath, 'utf8');
      
      if (!content.includes('react-helmet-async')) {
        this.logWarning('React Helmet Async not imported');
      }
      if (!content.includes('Helmet')) {
        this.logWarning('Helmet component not used');
      }
    }
  }

  // Check SEO configuration
  checkSEOConfig() {
    const configPath = path.join(__dirname, '../src/config/seo.js');
    if (this.checkFileExists(configPath, 'SEO config')) {
      const content = fs.readFileSync(configPath, 'utf8');
      
      if (!content.includes('seoConfig')) {
        this.logWarning('SEO configuration not properly structured');
      }
      if (!content.includes('structuredData')) {
        this.logWarning('Structured data configuration missing');
      }
    }
  }

  // Logging functions
  logPass(message) {
    console.log(`✅ PASS: ${message}`);
    this.results.passed++;
  }

  logFail(message) {
    console.log(`❌ FAIL: ${message}`);
    this.results.failed++;
    this.results.issues.push({ type: 'error', message });
  }

  logWarning(message) {
    console.log(`⚠️  WARN: ${message}`);
    this.results.warnings++;
    this.results.issues.push({ type: 'warning', message });
  }

  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('SEO AUDIT REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    if (this.results.issues.length > 0) {
      console.log('\nISSUES FOUND:');
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
      });
    }

    const score = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`\nSEO Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🎉 Excellent SEO optimization!');
    } else if (score >= 80) {
      console.log('👍 Good SEO optimization, some improvements needed');
    } else if (score >= 70) {
      console.log('⚠️  Fair SEO optimization, significant improvements needed');
    } else {
      console.log('🚨 Poor SEO optimization, major improvements required');
    }
  }

  // Run all checks
  runAudit() {
    console.log('🔍 Starting SEO Audit...\n');
    
    this.checkSitemap();
    this.checkRobotsTxt();
    this.checkHtmlHead();
    this.checkViteConfig();
    this.checkVercelConfig();
    this.checkSEOComponent();
    this.checkSEOConfig();
    
    this.generateReport();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SEOAuditor();
  auditor.runAudit();
}

module.exports = SEOAuditor; 