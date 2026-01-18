import React, { useState } from 'react';
import { 
  Layout, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message, 
  Select, 
  Spin,
  Tag,
  FloatButton,
  ConfigProvider,
  Tooltip
} from 'antd';
import { 
  BuildOutlined,
  RocketOutlined, 
  CopyOutlined, 
  ClearOutlined, 
  ThunderboltFilled,
  RobotOutlined,
  EditOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CodeOutlined,
  BgColorsOutlined,
  MobileOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  MailOutlined,
  RiseOutlined,
  DollarOutlined,
  CalendarOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  BulbOutlined,
  ArrowUpOutlined,
  FileWordOutlined // New Icon for Export
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import { saveAs } from 'file-saver'; // For saving the file
import { marked } from 'marked'; // For converting Markdown to HTML for the DOC
import { asBlob } from 'html-docx-js-typescript';
import './App.css';

// --- Configuration ---
const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option, OptGroup } = Select;
const API_URL = 'https://groqprompt.netlify.app/api/ai';

// --- Theme Config ---
const themeConfig = {
  token: {
    fontFamily: 'Work Sans, sans-serif',
    colorPrimary: '#e05a47',
    borderRadius: 8,
  },
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<string>('General Assistant');

  const getActiveIcon = () => {
    if (mode.includes('Developer')) return <CodeOutlined />;
    if (mode.includes('Writer')) return <EditOutlined />;
    if (mode.includes('Designer')) return <BgColorsOutlined />;
    return <RobotOutlined />;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt first!');
      return;
    }
    setLoading(true);
    setResult('');

    try {
      const systemContext = `ACT AS A ${mode.toUpperCase()}. Your goal is to provide high-quality, professional output suitable for a freelance client or project.`;
      const finalPrompt = `${systemContext}\n\nTASK:\n${prompt}`;

      const response = await axios.post<{ result: string }>(API_URL, {
        prompt: finalPrompt
      });

      if (response.data && response.data.result) {
        setResult(response.data.result);
        message.success('Content created!');
      } else {
        message.error('Unexpected server response.');
      }
    } catch (error) {
      console.error(error);
      message.error('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      message.success('Copied to clipboard');
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResult('');
    setMode('General Assistant');
  };

  // --- NEW: Handle Export to DOCX ---
  const handleExport = async () => {
    if (!result) return;
    
    try {
      // 1. Convert Markdown result to HTML
      const htmlContent = await marked.parse(result);
      
      // 2. Prepare HTML with basic styling for the DOCX
      // html-docx-js-typescript parses this HTML string into valid Word XML
      const docContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Arial', sans-serif; font-size: 11pt; }
              h1 { font-size: 20pt; color: #000000; }
              h2 { font-size: 16pt; color: #000000; }
              code { background-color: #ffffff; font-family: Consolas, monospace; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      // 3. Convert HTML string to DOCX Blob (Binary)
      // asBlob returns a Promise that resolves to the binary file data
      const blob = await asBlob(docContent);
      
      // 4. Trigger Save with .docx extension
      saveAs(blob as Blob, `FreelanceFlow_${mode.replace(/\s+/g, '_')}.docx`);
      message.success('Document downloaded!');
    } catch (error) {
      console.error('Export failed', error);
      message.error('Failed to export document.');
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className="layout-background">
        
        {/* Header */}
        <Header className="glass-header" style={{ padding: '0 40px', display: 'flex', alignItems: 'center' }}>
          <Space size="small">
            <ThunderboltFilled style={{ fontSize: '24px', color: '#e05a47' }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Freelance<span style={{ color: '#e05a47' }}>Flow</span>
            </Title>
          </Space>
        </Header>

        <Content style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '900px' }}>
            
            {/* Hero Text */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={2} style={{ marginBottom: '8px', fontWeight: 700 }}>
                What are you building today?
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Select a persona, describe your task, and let AI handle the heavy lifting.
              </Text>
            </div>

            {/* Input Card */}
            <Card bordered={false} className="cozy-card" style={{ marginBottom: '30px' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                
                {/* Role Selector */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666' }}>I AM ACTING AS A...</Text>
                  <Select 
                    defaultValue="General Assistant" 
                    size="large"
                    style={{ width: '100%' }}
                    onChange={(value) => setMode(value)}
                    value={mode}
                    optionFilterProp="children"
                    listHeight={400}
                  >
                    <Option value="General Assistant"><Space><RobotOutlined /> General Assistant</Space></Option>
                    
                    <OptGroup label="Writing & Content">
                      <Option value="Copywriter"><Space><EditOutlined /> Copywriter</Space></Option>
                      <Option value="SEO Content Writer"><Space><SearchOutlined /> SEO Specialist</Space></Option>
                      <Option value="Technical Writer"><Space><FileTextOutlined /> Technical Writer</Space></Option>
                      <Option value="Proofreader"><Space><CheckCircleOutlined /> Proofreader/Editor</Space></Option>
                      <Option value="Screenwriter"><Space><VideoCameraOutlined /> Scriptwriter</Space></Option>
                      <Option value="Ghostwriter"><Space><UserOutlined /> Ghostwriter</Space></Option>
                    </OptGroup>

                    <OptGroup label="Development & Tech">
                      <Option value="Full Stack Developer"><Space><CodeOutlined /> Full Stack Developer</Space></Option>
                      <Option value="Frontend Developer"><Space><BgColorsOutlined /> Frontend Developer</Space></Option>
                      <Option value="Backend Developer"><Space><CloudServerOutlined /> Backend Developer</Space></Option>
                      <Option value="Mobile App Developer"><Space><MobileOutlined /> Mobile App Dev</Space></Option>
                      <Option value="Data Scientist"><Space><BarChartOutlined /> Data Scientist</Space></Option>
                    </OptGroup>

                    <OptGroup label="Design & Creative">
                      <Option value="Graphic Designer"><Space><BgColorsOutlined /> Graphic Designer</Space></Option>
                      <Option value="Logo Designer"><Space><BulbOutlined /> Logo Designer</Space></Option>
                      <Option value="Video Editor"><Space><VideoCameraOutlined /> Video Editor</Space></Option>
                    </OptGroup>

                    <OptGroup label="Marketing & Strategy">
                      <Option value="Social Media Manager"><Space><MobileOutlined /> Social Media Manager</Space></Option>
                      <Option value="Email Marketer"><Space><MailOutlined /> Email Marketer</Space></Option>
                      <Option value="Digital Marketing Strategist"><Space><RiseOutlined /> Marketing Strategist</Space></Option>
                      <Option value="PPC Specialist"><Space><DollarOutlined /> PPC Specialist</Space></Option>
                    </OptGroup>

                    <OptGroup label="Business & Admin">
                      <Option value="Virtual Assistant"><Space><CalendarOutlined /> Virtual Assistant</Space></Option>
                      <Option value="Project Manager"><Space><ProjectOutlined /> Project Manager</Space></Option>
                      <Option value="Legal Consultant"><Space><SafetyCertificateOutlined /> Legal Consultant</Space></Option>
                      <Option value="Translator"><Space><GlobalOutlined /> Translator</Space></Option>
                      <Option value="Proposal Writer"><Space><FileTextOutlined /> Proposal Writer</Space></Option>
                    </OptGroup>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                     <Text strong style={{ color: '#666' }}>THE TASK</Text>
                     <Tag icon={getActiveIcon()} color="volcano" className="mode-tag">
                        {mode} Mode
                     </Tag>
                  </div>
                  
                  <TextArea 
                    rows={6} 
                    placeholder={`e.g., "Write a friendly follow-up email to a client who hasn't paid their invoice yet..."`} 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    style={{ 
                      fontSize: '16px', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      background: '#fcfcfd',
                      border: '1px solid #eee'
                    }}
                    disabled={loading}
                  />
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Button 
                    size="large" 
                    icon={<ClearOutlined />} 
                    onClick={handleClear}
                    disabled={loading}
                    type="text"
                    style={{ color: '#888' }}
                  >
                    Clear
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<RocketOutlined />} 
                    size="large" 
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={!prompt.trim()}
                    style={{ 
                        height: '48px', 
                        paddingLeft: '32px', 
                        paddingRight: '32px', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 14px 0 rgba(224, 90, 71, 0.39)'
                    }}
                  >
                    Generate Result
                  </Button>
                </div>
              </Space>
            </Card>

            {/* Results Card */}
            {(result || loading) && (
              <Card 
                className="cozy-card"
                bordered={false}
                title={
                    <Space>
                        <BuildOutlined style={{ color: '#e05a47' }} />
                        <span style={{ fontWeight: 600 }}>Result</span>
                    </Space>
                }
                extra={
                  <Space>
                    <Tooltip title="Download as .docx">
                        <Button 
                            shape="round"
                            icon={<FileWordOutlined />}
                            onClick={handleExport}
                            disabled={!result || loading}
                        >
                            Export
                        </Button>
                    </Tooltip>
                    <Tooltip title="Copy to Clipboard">
                        <Button 
                            type="primary"
                            ghost
                            shape="round"
                            icon={<CopyOutlined />} 
                            onClick={handleCopy} 
                            disabled={!result || loading}
                        >
                            Copy
                        </Button>
                    </Tooltip>
                  </Space>
                }
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Spin size="large" />
                    <Paragraph type="secondary" style={{ marginTop: '20px' }}>
                      Thinking like a {mode}...
                    </Paragraph>
                  </div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({node, className, children, ...props}) {
                          return (
                            <code 
                              className={className} 
                              style={{ 
                                background: '#f0f2f5', 
                                padding: '4px 8px', 
                                borderRadius: '6px',
                                fontFamily: 'Menlo, Monaco, Consolas, monospace',
                                fontSize: '0.9em',
                                color: '#e01e5a'
                              }} 
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        blockquote: ({node, ...props}) => (
                          <blockquote style={{ 
                            borderLeft: '4px solid #e05a47', // Terracotta border
                            paddingLeft: '16px', 
                            margin: '16px 0', 
                            fontStyle: 'italic',
                            background: '#fff7f5', // Very pale warm tint
                            padding: '12px 16px',
                            borderRadius: '0 8px 8px 0'
                          }} {...props} />
                        )
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                )}
              </Card>
            )}

          </div>
        </Content>

        <FloatButton.BackTop 
          type="primary" 
          icon={<ArrowUpOutlined />} 
          style={{ right: 40, bottom: 40 }}
        />

        <Footer style={{ textAlign: 'center', background: 'transparent', color: '#999' }}>
          FreelanceFlow AI ©{new Date().getFullYear()} — Built with ❤️ for Builders
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;