"use client";

import React from 'react';
import PlatformGeneratorUI from '../../components/PlatformGeneratorUI';
import { PromptStyle, LanguageStyle, StructureStyle, EmotionStyle, CreativeStrategy } from '../../lib/types';
import FeatureLayout from '../../components/FeatureLayout';

const WeChatGeneratorPage: React.FC = () => {
  const platformName = "WeChat Official Account Content Generator";
  const platformDescription = "Generate articles tailored for WeChat Official Accounts, focusing on engaging titles, clear structure, and a professional yet approachable tone.";
  const defaultTopic = "The Future of AI in Daily Life";
  const defaultKeywords = "AI, technology, daily impact, future trends";
  const defaultWordCount = 2000;

  const getPlatformPromptStyle = (): PromptStyle => {
    const style: PromptStyle = {
      style_name: "WeChat Article",
      style_description: "Style for generating articles for WeChat Official Accounts.",
      style_summary: "Professional and insightful WeChat article style.",
      target_audience: {
        description: "General audience on WeChat, interested in informative and engaging content.",
        age_group: "20-50",
        education_level: "High school or above",
        language_proficiency: "Native or fluent Chinese speakers (though this tool primarily generates in the user's language)",
        interests: ["Technology", "Lifestyle", "Current Affairs", "Professional Development"],
      },
      language: {
        language_variety: "Simplified Chinese (conceptual, actual output language may vary)",
        word_choice: {
          clarity_level: 5, // 1-5, 5 is very clear
          conciseness_level: 4, // 1-5, 5 is very concise
          formality_level: 4, // 1-5, 5 is very formal
          technical_depth: 3, // 1-5, 5 is very technical
          idiom_usage: ["现代网络用语", "少量成语"], // Modern internet slang, few idioms
        },
        sentence_structure: {
          complexity: 3, // 1-5, 5 is very complex
          average_length: "15-25 words",
          variety: ["Declarative", "Interrogative (occasionally for engagement)"],
        },
        grammar: {
          tense: "Present and Future",
          voice: "Active preferred",
          mood: "Informative and Engaging",
        },
        rhetoric: ["清晰的论证", "适当的举例"], // Clear arguments, appropriate examples
      } as LanguageStyle,
      structure: {
        format_type: "Article",
        length_constraints: "1500-2500 words (as per user input)",
        paragraph_length: "中等, 100-200字", // Medium, 100-200 characters (or words depending on interpretation)
        heading_usage: "Subheadings for sections",
        list_format: "Numbered or bulleted for clarity",
        quotation_style: "Standard Chinese quotation marks 「」 『』",
        referencing_style: "None explicitly required, inline attribution if necessary",
        hierarchy_pattern: "引言 - 正文 (2-4小标题) - 结语", // Introduction - Body (2-4 subheadings) - Conclusion
      } as StructureStyle,
      emotion: {
        tone: "专业、有深度，但不失亲和力", // Professional, insightful, but approachable
        emotional_arc: "Engage -> Inform -> Inspire/Conclude",
        humor_level: 1, // 1-5, 1 is minimal humor
        empathy_level: 3, // 1-5, 3 is moderate empathy
      } as EmotionStyle,
      creative_strategy: {
        storytelling_elements: ["Anecdotes or examples to illustrate points"],
        analogies_metaphors: "Use sparingly for clarification",
        perspective: "Third-person, objective yet engaging",
        call_to_action: "Implicit (e.g., encourage sharing/discussion) or explicit if requested",
      } as CreativeStrategy,
      cultural_references: {
        region: "Mainland China",
        common_knowledge: ["Current tech trends", "Social media dynamics"],
        avoid_sensitive_topics: true,
      },
      formatting_guidelines: {
        line_spacing: "1.5 lines",
        font_style: "Standard sans-serif (conceptual)",
        emphasis_techniques: ["Bold for key phrases", "Occasional use of WeChat-style emojis if contextually appropriate (though AI might not generate these directly)"],
        multimedia_integration: "Placeholder for images/videos (e.g., [插入图片：描述])",
      },
      ethical_considerations: {
        bias_avoidance: "Strive for objective and balanced views",
        fact_checking: "Assume information provided in the prompt is accurate; generate based on that.",
        transparency: "N/A for direct AI output, but good practice for publishers.",
      },
      output_requirements: {
        file_format: "Markdown (internally, then rendered)",
        language_specific_conventions: "Follow standard practices for written Chinese if applicable.",
      },
      domain_specific_rules: {
        "WeChat": "Consider mobile readability, use of short paragraphs, and engaging subheadings. Title is crucial for click-through."
      }
    };
    return style;
  };

  const getPlatformInstructions = (topic: string, keywords: string[], wordCount: number): string => {
    const keywordString = keywords.join(", ");
    return `
Please generate a high-quality article for a WeChat Official Account.

**Important First Line Requirement:**
The very first line of your output MUST be the title, prefixed with "Title: ". For example: "Title: This is an Engaging WeChat Title"

**Article Topic:**
${topic}

**Keywords to Incorporate:**
${keywordString}

**Target Word Count:**
Approximately ${wordCount} words.

**Structure and Formatting:**
1.  **Title:** Craft a compelling and engaging title. Remember, this must be the first line and start with "Title: ".
2.  **Introduction (引言):**
    *   Grab the reader's attention.
    *   Briefly introduce the topic and its relevance.
    *   State the article's main purpose or argument.
3.  **Body (正文):**
    *   Divide into 2-4 main sections, each with a clear subheading.
    *   Present information logically with clear arguments and supporting details.
    *   Use appropriate examples (适当的举例) to illustrate points.
    *   Paragraphs should be of medium length (around 100-200 words or Chinese characters).
    *   Maintain a professional, insightful, yet approachable tone (专业、有深度，但不失亲和力).
4.  **Conclusion (结语):**
    *   Summarize the main points.
    *   Offer a final thought, takeaway message, or a call to action (e.g., encourage discussion, share the article).

**Style and Tone:**
*   **Overall Style:** Professional, insightful, and well-researched, but also engaging and easy to understand for a general WeChat audience.
*   **Language:** Clear, concise, and formal (formality level 4/5). Use modern language, but avoid excessive jargon unless explained.
*   **Engagement:** Make the content interesting. Consider using rhetorical questions sparingly or directly addressing the reader in a way that is common for WeChat articles.
*   **Formatting for Readability:**
    *   Ensure clear separation between paragraphs.
    *   Use bold text for subheadings and key phrases if it enhances readability.
    *   (Conceptual - AI may not produce actual emojis) If appropriate, consider where a WeChat emoji might be used to break text or add personality, but prioritize professional tone.

**Content Focus:**
*   Provide valuable information and insights related to the topic and keywords.
*   Ensure arguments are well-supported.
*   The content should be original and engaging.

Please generate the full article based on these instructions.
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

export default WeChatGeneratorPage;
