// ===========================
// CONTENT LOADER - Blog Feed
// ===========================

const ContentLoader = {
    blogPostsContainer: null,
    rss2JsonApiKey: 'YOUR_API_KEY_HERE', // User can register at rss2json.com
    wixBlogUrl: 'https://stirfriedrice.wixsite.com/2024-fantasydiscgolf/blog',

    init() {
        this.blogPostsContainer = document.getElementById('blogPosts');
        this.loadBlogPosts();
    },

    // Try to load blog posts from Wix
    async loadBlogPosts() {
        // Try multiple RSS feed URL patterns that Wix might use
        const possibleRSSUrls = [
            'https://stirfriedrice.wixsite.com/2024-fantasydiscgolf/blog-feed.xml',
            'https://stirfriedrice.wixsite.com/2024-fantasydiscgolf/rss.xml',
            'https://stirfriedrice.wixsite.com/2024-fantasydiscgolf/feed.xml',
            'https://stirfriedrice.wixsite.com/2024-fantasydiscgolf/blog/rss.xml'
        ];

        let success = false;

        for (const rssUrl of possibleRSSUrls) {
            try {
                const posts = await this.fetchViaRSS2JSON(rssUrl);
                if (posts && posts.length > 0) {
                    this.displayBlogPosts(posts);
                    success = true;
                    break;
                }
            } catch (error) {
                // Continue to next URL
                console.log(`Failed to fetch from ${rssUrl}:`, error);
            }
        }

        if (!success) {
            // Fallback: Show manual message
            this.showFallbackMessage();
        }
    },

    // Fetch RSS feed via RSS2JSON service
    async fetchViaRSS2JSON(rssUrl) {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('RSS2JSON fetch failed');
        }

        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Return only the first 3 posts
            return data.items.slice(0, 3);
        }

        return null;
    },

    // Display blog posts in the UI
    displayBlogPosts(posts) {
        const ul = document.createElement('ul');

        posts.forEach(post => {
            const li = document.createElement('li');
            const link = document.createElement('a');

            link.href = post.link;
            link.textContent = post.title;
            link.target = '_blank';
            link.rel = 'noopener';

            li.appendChild(link);
            ul.appendChild(li);
        });

        this.blogPostsContainer.innerHTML = '';
        this.blogPostsContainer.appendChild(ul);
    },

    // Show fallback message when RSS is unavailable
    showFallbackMessage() {
        this.blogPostsContainer.innerHTML = `
            <p style="color: var(--text-secondary); font-size: 0.5rem; font-style: italic;">
                📝 Latest posts available on the blog! Click "Read More" below to check them out.
            </p>
        `;
    }
};

// Initialize content loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});
