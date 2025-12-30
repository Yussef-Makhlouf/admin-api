/**
 * Data Migration Script
 * Migrates existing blog and service data from TypeScript files to MongoDB
 * 
 * Run with: node scripts/migrate-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Category = require('../models/Category');

// Blog data from the website
const blogPosts = [
    {
        slug: "best-roof-insulation-riyadh",
        title: "دليلك الشامل لاختيار نوع العزل المناسب لمنزلك في السعودية",
        excerpt: "تعرف على أنواع العزل المختلفة ومميزات كل نوع وكيف تختار الأنسب لمنزلك حسب المناخ والموقع والميزانية.",
        content: "## مقدمة: لماذا العزل ضرورة وليس رفاهية؟\n\nفي المناخ السعودي الحار، يعتبر العزل استثماراً ذكياً...",
        image: "/cover.png",
        category: "دليل شامل",
        featured: true,
        status: "published",
        publishedAt: new Date("2024-01-15"),
        relatedServices: ["/services/waterproofing", "/services/foam-insulation"],
    },
    {
        slug: "thermal-insulation-electricity-savings",
        title: "أهمية العزل الحراري في تقليل فواتير الكهرباء: دراسة شاملة وحلول عملية 2024",
        excerpt: "هل تعلم أن 70% من حرارة منزلك تدخل عبر السقف والجدران؟ اكتشف كيف يمكن للعزل الحراري الصحيح خفض فاتورتك بنسبة 40% سنوياً.",
        content: "## مقدمة: أزمة الطاقة وتكاليف التبريد\n\nفي المملكة العربية السعودية...",
        image: "/cover1.png",
        category: "توفير الطاقة",
        featured: true,
        status: "published",
        publishedAt: new Date("2024-01-10"),
        relatedServices: ["/services/foam-insulation"],
    },
    {
        slug: "water-leak-warning-signs",
        title: "الموسوعة الشاملة لكشف تسربات المياه: 10 علامات خفية ومخاطرها الكارثية",
        excerpt: "لا تنتظر حتى يسقط السقف! دليلك الاحترافي لاكتشاف التسربات الصامتة.",
        content: "## هل منزلك ينزف بصمت؟\n\nتسربات المياه هي القاتل الصامت للمباني...",
        image: "/cover3.png",
        category: "كشف التسربات",
        featured: false,
        status: "published",
        publishedAt: new Date("2024-01-05"),
        relatedServices: ["/services/leak-detection", "/services/waterproofing"],
    },
    {
        slug: "polyurethane-foam-technology",
        title: "عزل الفوم (البولي يوريثان): أسرار التقنية التي غيرت معايير البناء في السعودية",
        excerpt: "تحليل علمي وتقني شامل لمادة البولي يوريثان فوم.",
        content: "## هل الفوم مجرد مادة بيضاء؟\n\nكثيرون يسمعون عن عزل الفوم...",
        image: "/cover4.png",
        category: "تكنولوجيا البناء",
        featured: false,
        status: "published",
        publishedAt: new Date("2024-01-01"),
        relatedServices: ["/services/foam-insulation"],
    },
    {
        slug: "roof-insulation-common-mistakes",
        title: "أخطاء شائعة في عزل الأسطح تؤدي لفشل العزل بعد سنة واحدة",
        excerpt: "رغم جودة مواد العزل، إلا أن أخطاء التنفيذ الخاطئة قد تحوّل العزل إلى عبء مكلف.",
        content: "## مقدمة: لماذا يفشل العزل رغم استخدام مواد ممتازة؟\n\nكثير من شكاوى العملاء...",
        image: "/cover3.png",
        category: "أخطاء شائعة",
        featured: false,
        status: "published",
        publishedAt: new Date("2024-01-20"),
        relatedServices: ["/services/foam-insulation", "/services/waterproofing"],
    },
];

// Categories to create
const categories = [
    { name: "دليل شامل", slug: "comprehensive-guide", type: "blog" },
    { name: "توفير الطاقة", slug: "energy-saving", type: "blog" },
    { name: "كشف التسربات", slug: "leak-detection", type: "blog" },
    { name: "تكنولوجيا البناء", slug: "building-technology", type: "blog" },
    { name: "أخطاء شائعة", slug: "common-mistakes", type: "blog" },
    { name: "مشاكل وحلول", slug: "problems-solutions", type: "blog" },
    { name: "توعية", slug: "awareness", type: "blog" },
    { name: "عزل فوم", slug: "foam-insulation", type: "service" },
    { name: "عزل مائي", slug: "waterproofing", type: "service" },
    { name: "كشف تسربات", slug: "leak-detection-service", type: "service" },
    { name: "عزل خزانات", slug: "tank-insulation", type: "service" },
];

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional)
        // await Blog.deleteMany({});
        // await Category.deleteMany({});

        // Create categories
        console.log('Creating categories...');
        for (const cat of categories) {
            const exists = await Category.findOne({ slug: cat.slug });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            }
        }

        // Create blogs
        console.log('Creating blogs...');
        for (const blog of blogPosts) {
            const exists = await Blog.findOne({ slug: blog.slug });
            if (!exists) {
                await Blog.create(blog);
                console.log(`Created blog: ${blog.title}`);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log(`Categories: ${await Category.countDocuments()}`);
        console.log(`Blogs: ${await Blog.countDocuments()}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
