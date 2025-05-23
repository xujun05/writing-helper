"use client";

import React from 'react';
import PlatformGeneratorUI from '../../components/PlatformGeneratorUI';
import { 
  PromptStyle, 
  LanguageStyle, 
  StructureStyle, 
  EmotionStyle, 
  CreativeStrategy,
  AudienceStyle,
  CulturalReferences,
  FormattingGuidelines,
  EthicalConsiderations,
  OutputRequirements,
  DomainSpecificRules,
  WordChoice,
  SentenceStructure,
  Grammar,
  ListFormatOptions,
  QuotationStyleOptions,
  ReferencingStyleOptions,
  FontStyles,
  EmphasisTechniques,
  MultimediaIntegrationOptions
} from '../../lib/types';
import FeatureLayout from '../../components/FeatureLayout';

const XiaohongshuGeneratorPage: React.FC = () => {
  const platformName = "Xiaohongshu Post Generator";
  const platformDescription = "Generate trendy and engaging posts for Xiaohongshu, complete with emojis, short paragraphs, and a friendly, conversational tone.";
  const defaultTopic = "My Favorite Cafe Discoveries";
  const defaultKeywords = "cafe, coffee, lifestyle, recommendation, aesthetic";
  const defaultWordCount = 800;

  const getPlatformPromptStyle = (): PromptStyle => {
    const style: PromptStyle = {
      style_name: "Xiaohongshu Post",
      style_description: "Style for generating trendy and engaging Xiaohongshu posts.",
      style_summary: "Friendly, conversational, and emoji-rich Xiaohongshu post style.",
      target_audience: {
        description: "Young, trend-conscious users on Xiaohongshu, primarily female.",
        age_group: "18-35",
        education_level: "High school or above",
        language_proficiency: "Native Chinese speakers (conceptual, output language may vary)",
        interests: ["Fashion", "Beauty", "Travel", "Food", "Lifestyle", "Shopping"],
      } as AudienceStyle,
      language: {
        language_variety: "Simplified Chinese with trendy slang and emojis (conceptual)",
        word_choice: {
          clarity_level: 4,
          conciseness_level: 5,
          formality_level: 2, // Friendly and conversational
          technical_depth: 1,
          idiom_usage: ["流行语", "网络热词"], // Trendy slang, internet buzzwords
        } as WordChoice,
        sentence_structure: {
          complexity: 2, // Short sentences primarily
          average_length: "10-20 words/characters",
          variety: ["短句为主", "穿插表情符号"], // Primarily short sentences, interspersed with emojis
        } as SentenceStructure,
        grammar: {
          tense: "Present, Past (for sharing experiences)",
          voice: "Active, first-person",
          mood: "Enthusiastic, Friendly, Helpful",
        } as Grammar,
        rhetoric: ["大量使用emoji", "口语化表达", "分点罗列"], // Heavy use of emojis, colloquial expressions, bullet points
      } as LanguageStyle,
      structure: {
        format_type: "Social Media Post (Xiaohongshu)",
        length_constraints: "300-800 words (as per user input)",
        paragraph_length: "短小, 30-70字", // Short, 30-70 characters/words
        heading_usage: "No formal headings, use emojis or bold text for emphasis of sections if any",
        list_format: "Emoji bullets (e.g., ✨, 💖) or simple numbered lists" as ListFormatOptions,
        quotation_style: "Informal, or standard Chinese quotes if needed" as QuotationStyleOptions,
        referencing_style: "None, or tag accounts if applicable" as ReferencingStyleOptions,
        hierarchy_pattern: "开门见山 (吸睛开头) - 重点先行 (核心内容/推荐) - 分点罗列 (细节/步骤) - 结尾互动 (例如提问或号召点赞收藏)", // Catchy opening - Key points first - Bulleted details - Interactive ending (e.g., questions, call for likes/saves)
        transition_style: "使用表情符号或简单分隔符 (e.g., ---, ✨✨✨) 过渡", // Use emojis or simple separators for transitions
      } as StructureStyle,
      emotion: {
        tone: "轻松、口语化、亲切，像朋友间对话", // Relaxed, colloquial, friendly, like a chat between friends
        emotional_arc: "Excitement -> Information/Sharing -> Engagement",
        humor_level: 2, // Light humor is acceptable
        empathy_level: 3,
        expression_style: "直接活泼", // Direct and lively
      } as EmotionStyle,
      creative_strategy: {
        storytelling_elements: ["Personal anecdotes", "Relatable experiences"],
        analogies_metaphors: "Simple and relatable if used",
        perspective: "First-person",
        call_to_action: "Encourage likes, saves, comments, follows. Ask questions.",
        // Integrating 'uniqueness.imagery_system' here:
        visual_appeal_notes: "Content should evoke lifestyle imagery: Food, fashion, travel, aesthetics. Mentioning '生活化场景', '美食、时尚、旅行等常见小红书主题'.",
      } as CreativeStrategy,
      cultural_references: {
        region: "Mainland China (Xiaohongshu primary audience)",
        common_knowledge: ["Current social media trends", "Popular brands/products", "Internet slang"],
        avoid_sensitive_topics: true,
      } as CulturalReferences,
      formatting_guidelines: {
        line_spacing: "Generous, for readability on mobile",
        font_style: "Standard device fonts" as FontStyles,
        emphasis_techniques: ["Bold text for key info", "Heavy emoji usage ✨💖🔥"],
        multimedia_integration: "Assume text will be accompanied by images/video (user-provided). Text should be descriptive and engaging to complement visuals. e.g., [图片描述：一张咖啡拉花照片]" as MultimediaIntegrationOptions,
      } as FormattingGuidelines,
      ethical_considerations: {
        bias_avoidance: "Be mindful of promoting inclusivity if applicable.",
        fact_checking: "User responsible for factual accuracy of topic.",
        transparency: "If sponsored, should be disclosed (though AI won't add this).",
      } as EthicalConsiderations,
      output_requirements: {
        file_format: "Markdown with emojis",
        language_specific_conventions: "Follow Xiaohongshu's informal style.",
      } as OutputRequirements,
      domain_specific_rules: {
        "Xiaohongshu": "Title is crucial (often includes emojis). Content should be scannable with short paragraphs. Hashtags are important for discoverability. Visuals (not generated by AI) are key, text should complement them."
      } as DomainSpecificRules
    };
    return style;
  };

  const getPlatformInstructions = (topic: string, keywords: string[], wordCount: number): string => {
    const keywordString = keywords.join(", ");
    const hashtags = keywords.map(kw => `#${kw.replace(/\s+/g, '')}`).join(" "); // Create hashtags

    return `
Please generate an engaging Xiaohongshu post.

**VERY IMPORTANT: TITLE REQUIREMENT**
The very first line of your output MUST be the title, prefixed with "Title: ". The title should be catchy and include relevant emojis. For example: "Title: ✨ My Top 3 Cafe Secrets! ☕️🤫"

**Article Topic:**
${topic}

**Keywords to Incorporate (and use as hashtags):**
${keywordString}

**Target Word Count:**
Approximately ${wordCount} words. (Xiaohongshu posts are often concise, around 300-800 words)

**Structure and Formatting (Xiaohongshu Style):**
1.  **Title:** (As per the "VERY IMPORTANT" instruction above). Make it irresistible!
2.  **Opening (开门见山):**
    *   Start with a hook! Something surprising, relatable, or exciting. Use emojis! 💃🎉
    *   Immediately state what the post is about in a friendly way.
3.  **Main Content (重点先行 - 分点罗列):**
    *   Present the core message or recommendations early.
    *   Break down information into short, digestible paragraphs (IMPORTANT: 30-70 words/characters each).
    *   Use emojis liberally in every paragraph to add personality and visual appeal. ✨💖🌟
    *   Use bullet points (e.g., 💖 Point 1, ✨ Point 2) or numbered lists for tips, steps, or multiple items.
    *   Maintain a friendly, conversational, and enthusiastic tone throughout. Imagine you're chatting with a friend!
4.  **Closing (结尾互动):**
    *   End with a call to action: ask a question to encourage comments, or invite readers to like 👍, save 🌟, and follow.
    *   Example: "Which one is your fave? Let me know below! 👇 Don't forget to like and save if this was helpful! 💖"

**Style and Tone:**
*   **Overall Tone:** Relaxed, colloquial, friendly, enthusiastic, and approachable (轻松、口语化、亲切). Like talking to a bestie!
*   **Language:** Use simple, direct language. Incorporate trendy slang or internet buzzwords if appropriate for the topic.
*   **Emojis:** This is CRUCIAL for Xiaohongshu. Use a LOT of relevant emojis throughout the text, in the title, body, and closing. Make it colorful and expressive! 🥳🤩
*   **Paragraphs:** Keep them VERY short and scannable.

**Content Focus:**
*   Share personal experiences, tips, recommendations, or discoveries.
*   Content should be practical, inspiring, or entertaining.
*   Focus on visually appealing aspects if the topic allows (describe things as if the reader can see them).

**Hashtags:**
*   At the very end of the post, include relevant hashtags based on the keywords. For example:
    ${hashtags}
    (You can add 2-5 more relevant popular hashtags if you know them for the topic)

Please generate the full Xiaohongshu post based on these instructions. Remember the emojis and short paragraphs!
    `;
  };

  return (
    <FeatureLayout
      title={platformName}
      subtitle={platformDescription}
    >
      <PlatformGeneratorUI
        platformName={platformName}
        platformDescription={platformDescription}
        defaultTopic={defaultTopic}
        defaultKeywords={defaultKeywords}
        defaultWordCount={defaultWordCount}
        getPlatformPromptStyle={getPlatformPromptStyle}
        getPlatformInstructions={getPlatformInstructions}
      />
    </FeatureLayout>
  );
};

export default XiaohongshuGeneratorPage;
