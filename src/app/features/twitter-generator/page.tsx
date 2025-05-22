"use client";

import React from 'react';
import { Metadata } from 'next';
import PlatformGeneratorUI from '../../../components/PlatformGeneratorUI';
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
} from '../../../lib/types';
import FeatureLayout from '../../../components/FeatureLayout';

// Metadata for the page
export const metadata: Metadata = {
  title: "Twitter Post Generator",
  description: "AI-powered content generation for Twitter.",
};

const TwitterGeneratorPage: React.FC = () => {
  const platformName = "Twitter Post Generator";
  const platformDescription = "Craft concise and impactful posts for Twitter, keeping within the character limit and focusing on direct engagement.";
  const defaultTopic = "Thoughts on the latest tech news";
  const defaultKeywords = "tech, news, innovation, opinion";
  const defaultWordCount = 40; // Approx words for a tweet, character limit is key

  const getPlatformPromptStyle = (): PromptStyle => {
    const style: PromptStyle = {
      style_name: "Twitter Post",
      style_description: "Style for generating concise and impactful Twitter posts.",
      style_summary: "Concise, impactful, and direct Twitter post style.",
      target_audience: {
        description: "General Twitter audience, varies by topic.",
        age_group: "Any",
        education_level: "Any",
        language_proficiency: "Varies",
        interests: ["Current events", "Niche topics based on keywords"],
      } as AudienceStyle,
      language: {
        language_variety: "User's language, typically informal for Twitter",
        word_choice: {
          clarity_level: 5,
          conciseness_level: 5, // Max conciseness
          formality_level: 3, // Neutral, can lean informal
          technical_depth: 2, // Generally low, unless topic-specific
          idiom_usage: ["流行语", "hashtags"], // Trendy slang, hashtags
        } as WordChoice,
        sentence_structure: {
          complexity: 1, // Very simple sentences
          average_length: "5-15 words", // Short
          variety: ["短句", "避免复杂从句"], // Short sentences, avoid complex clauses
        } as SentenceStructure,
        grammar: {
          tense: "Present or relevant to topic",
          voice: "Active preferred",
          mood: "Direct, Informative, Engaging",
        } as Grammar,
        rhetoric: ["简洁明了", "有力表达", "可包含hashtags"], // Concise, powerful expression, can include hashtags
      } as LanguageStyle,
      structure: {
        format_type: "Social Media Post (Tweet)",
        length_constraints: "Max 280 characters (primary constraint)",
        paragraph_length: "极短, 1-2句话", // Extremely short, 1-2 sentences (often just one)
        heading_usage: "None",
        list_format: "None, or very brief inline" as ListFormatOptions,
        quotation_style: "Standard or informal" as QuotationStyleOptions,
        referencing_style: "@mentions if applicable" as ReferencingStyleOptions,
        hierarchy_pattern: "核心观点先行 - (可选)补充说明/链接 - (可选)相关hashtags", // Core point - optional support/link - optional hashtags
        transition_style: "None needed for such short text",
      } as StructureStyle,
      emotion: {
        tone: "简短有力，可以略带个性", // Short and powerful, can have a bit of personality
        emotional_arc: "Direct impact",
        humor_level: 2, // Can be humorous depending on topic/personality
        empathy_level: 2,
        expression_style: "Direct and punchy",
      } as EmotionStyle,
      creative_strategy: {
        storytelling_elements: ["Very brief, if any (e.g., a quick personal take)"],
        analogies_metaphors: "Rarely, must be very concise",
        perspective: "First or third person, direct",
        call_to_action: "Implicit (e.g., provoke thought) or explicit (e.g., 'Check this out!', 'What do you think?')",
        visual_appeal_notes: "N/A for text-only generation; emojis can add visual elements.",
      } as CreativeStrategy,
      cultural_references: {
        region: "Global or topic-specific",
        common_knowledge: ["Current events", "Internet culture"],
        avoid_sensitive_topics: true, // General guideline
      } as CulturalReferences,
      formatting_guidelines: {
        line_spacing: "N/A",
        font_style: "Standard device fonts" as FontStyles,
        emphasis_techniques: ["Hashtags for keywords", "Emojis for tone/emphasis"],
        multimedia_integration: "Text only; can suggest accompanying image/GIF if context implies" as MultimediaIntegrationOptions,
      } as FormattingGuidelines,
      ethical_considerations: {
        bias_avoidance: "Strive for neutrality or clearly opinionated if intended.",
        fact_checking: "User responsible for facts.",
        transparency: "N/A",
      } as EthicalConsiderations,
      output_requirements: {
        file_format: "Plain text",
        language_specific_conventions: "Follow Twitter conventions (hashtags, @mentions).",
      } as OutputRequirements,
      domain_specific_rules: {
        "Twitter": "Strict 280 character limit. Hashtags are crucial. Brevity and impact are key. No titles or prefixes."
      }
    };
    return style;
  };

  const getPlatformInstructions = (topic: string, keywords: string[], wordCount: number): string => {
    // wordCount is less relevant here, character limit is king.
    const keywordString = keywords.join(", ");
    const hashtags = keywords.map(kw => `#${kw.replace(/\s+/g, '')}`).join(" ");

    return `
IMPORTANT INSTRUCTIONS FOR TWITTER POST:

1.  **CHARACTER LIMIT:** Your entire response MUST be a single tweet, 280 characters or less. This is the most critical rule.
2.  **NO PREFIX:** Do NOT include any prefix like "Title:" or any other text before the tweet itself. Your response should be the tweet content directly.
3.  **CONTENT:**
    *   Address the topic: "${topic}".
    *   Incorporate keywords: "${keywordString}".
    *   Be concise, impactful, and engaging.
4.  **HASHTAGS:** Include relevant hashtags, like: ${hashtags}. You can add 1-2 more if they are highly relevant and fit within the character limit.
5.  **TONE:** Keep it short, powerful, and it can have a bit of personality.

Craft the tweet now. Remember the 280-character limit for the entire output.
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
        defaultWordCount={defaultWordCount} // This UI prop is for general guidance/display
        getPlatformPromptStyle={getPlatformPromptStyle}
        getPlatformInstructions={getPlatformInstructions} // This will enforce the character limit
      />
    </FeatureLayout>
  );
};

export default TwitterGeneratorPage;
