import WritingAssistant from './components/WritingAssistant';
import FeatureLayout from './components/FeatureLayout';

export default function Home() {
  return (
    <FeatureLayout title="公文写作助手" subtitle="根据您的结构化指令，AI 助您高效撰写专业、规范的各类公文。">
      <WritingAssistant />
    </FeatureLayout>
  );
}
