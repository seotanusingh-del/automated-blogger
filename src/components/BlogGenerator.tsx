import React, { useState } from 'react';

interface BlogPackage {
  title: string;
  markdownContent: string;
  imageUrl: string;
  imagePrompt: string;
}

export default function BlogGenerator() {
  const [topic, setTopic] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [blogPost, setBlogPost] = useState<BlogPackage | null>(null);

  // 1. Generate the optimized system prompt based on user's topic
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userTopic = e.target.value;
    setTopic(userTopic);

    if (userTopic.trim()) {
      setGeneratedPrompt(
        `Write a comprehensive, engaging, SEO-optimized blog post about "${userTopic}". ` +
        `Include a catchy title, an introduction, multiple subheadings, and a conclusion. ` +
        `Format the output strictly in clean Markdown format.`
      );
    } else {
      setGeneratedPrompt('');
    }
  };

  // 2. Fetch data from Pollinations AI endpoints
  const generateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setBlogPost(null);

    try {
      // Step A: Generate the text content using Pollinations Text API
      const textResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: topic,
          airlineName: 'Travel',
          city: 'Worldwide',
          country: 'United States',
          tfn: '+1-888-794-3464',
          recentPosts: []
        })
      });

      if (!textResponse.ok) throw new Error('Failed to generate text content');
      const textResult = await textResponse.json();

      // Step B: Formulate a dedicated image prompt based on the topic
      const visualPrompt = `High quality professional editorial photography representing ${topic}, cinematic lighting, 8k resolution`;
      const encodedVisualPrompt = encodeURIComponent(visualPrompt);

      // Step C: Construct the free structural Image URL from Pollinations
      const imageResponse = await fetch(`/api/images/pollinations?prompt=${encodedVisualPrompt}`);
      const imageData = await imageResponse.json();
      if (!imageResponse.ok || !imageData.url) throw new Error(imageData.error || 'Failed to generate featured image');
      const finalImageUrl = imageData.url;

      setBlogPost({
        title: `Blog Post: ${topic}`,
        markdownContent: textResult.data?.overview || textResult.data?.title || 'Content generated successfully.',
        imagePrompt: visualPrompt,
        imageUrl: finalImageUrl
      });

    } catch (error) {
      console.error('Generation Error:', error);
      alert('Something went wrong during generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>AI Blog Generator</h1>

      <form onSubmit={generateBlog} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>1. Enter Blog Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={handleTopicChange}
            placeholder="e.g., The Future of Electric Flying Cars"
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        {generatedPrompt && (
          <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #0070f3' }}>
            <strong style={{ fontSize: '14px', color: '#666' }}>Generated Prompt Behind the Scenes:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontStyle: 'italic', color: '#333' }}>{generatedPrompt}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          style={{
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Generating Content...' : '⚡ Generate Full Blog Package'}
        </button>
      </form>

      {/* Output Section */}
      {blogPost && (
        <div style={{ marginTop: '40px', borderTop: '2px solid #eaeaea', paddingTop: '20px' }}>
          <h2>{blogPost.title}</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#555' }}>Generated Featured Image:</h3>
            <img
              src={blogPost.imageUrl}
              alt={topic}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            />
            <p style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}><strong>Image Prompt used:</strong> {blogPost.imagePrompt}</p>
          </div>

          <h3>Article Content (Raw Markdown):</h3>
          <textarea
            readOnly
            value={blogPost.markdownContent}
            style={{ width: '100%', height: '300px', padding: '10px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
      )}
    </div>
  );
}
