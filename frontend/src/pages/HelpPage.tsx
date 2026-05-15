import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('help.title')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* 项目介绍 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('help.introduction')}
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>
              院感暴发桌面线索链推演系统（Infection-Outbreak-Puzzle-Drills）是一款专为医院感染控制专业人员设计的培训演练工具。
            </p>
            <p>
              系统通过谜题式推演方式，帮助感控专员在脱敏数据上模拟暴发调查流程。每条线索对应一个可验证的数据检查点，通过完整的线索链通关来学习暴发判断标准。
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">核心功能：</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>模拟院感暴发场景的谜题式推演</li>
                <li>床位流转、抗菌药物、微生物培养等多源数据整合</li>
                <li>基于规则的暴发判断引擎</li>
                <li>SimPy 离散事件仿真生成暴发场景</li>
                <li>培训评分与推演报告生成</li>
                <li>支持 CLI 和 Web 两种交互模式</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">技术栈：</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Python</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">SimPy</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">FastAPI</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">TypeScript</span>
              </div>
            </div>
          </div>
        </section>

        {/* 规则说明 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('help.rules')}
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rule 001: 同病区同病原菌聚集</h3>
              <p className="text-gray-600 text-sm">
                3天内同一病区出现2例及以上相同病原菌感染，触发疑似暴发预警。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rule 002: 抗菌药物使用强度异常</h3>
              <p className="text-gray-600 text-sm">
                抗菌药物使用强度（DDD）超出历史基准值30%以上，提示可能存在暴发风险。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rule 003: 微生物培养阳性率骤升</h3>
              <p className="text-gray-600 text-sm">
                特定病原菌培养阳性率超出历史均值2个标准差，提示异常聚集。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rule 004: 器械相关感染聚集</h3>
              <p className="text-gray-600 text-sm">
                CLABSI（中心静脉导管相关血流感染）、CAUTI（导尿管相关泌尿道感染）、VAP（呼吸机相关肺炎）发生率上升。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rule 005: 暴发确认与报告</h3>
              <p className="text-gray-600 text-sm">
                综合分析各项指标，确认暴发后生成正式调查报告，包括时间线、传播途径分析和控制措施建议。
              </p>
            </div>
          </div>
        </section>

        {/* 操作指南 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('help.operations')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">第一步：开始推演</h3>
              <p className="text-gray-600 text-sm">
                在首页点击「开始新推演」按钮，系统将创建一个新的推演会话，并分配第一个线索。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">第二步：分析线索</h3>
              <p className="text-gray-600 text-sm">
                阅读线索描述，查看数据检查点中的床位流转、抗菌药物、微生物培养数据，分析是否存在暴发特征。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">第三步：验证答案</h3>
              <p className="text-gray-600 text-sm">
                根据分析结果，选择或输入答案进行验证。正确答案将解锁下一条线索。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">第四步：完成推演</h3>
              <p className="text-gray-600 text-sm">
                当所有线索链验证完成后，系统将生成包含评分和改进建议的推演报告。
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">CLI 模式</h3>
              <p className="text-gray-600 text-sm mb-2">
                如需使用 CLI 模式，运行以下命令：
              </p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`# 启动谜题会话
python -m backend puzzle start

# 验证检查点
python -m backend puzzle verify <clue_id> <answer>

# 生成报告
python -m backend report generate <session_id>`}
              </pre>
            </div>
          </div>
        </section>

        {/* 常见问题 FAQ */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('help.faq')}
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-medium text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Q: 推演有时间限制吗？
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 text-sm mt-2">
                默认推演时间为30分钟。如果时间不足，系统会显示警告提示。如需调整，可在初始化仿真时配置。
              </p>
            </details>
            <details className="group">
              <summary className="font-medium text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Q: 如何导入自己的数据？
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 text-sm mt-2">
                在首页或数据导入页面，可以拖拽上传 CSV/Excel 文件。系统支持床位流转、抗菌药物、微生物培养三类数据导入，并提供字段映射功能。
              </p>
            </details>
            <details className="group">
              <summary className="font-medium text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Q: 评分标准是什么？
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 text-sm mt-2">
                评分基于三个维度：准确度（线索验证正确率）、速度（用时 vs 预期时间）、提示使用（使用提示越少分数越高）。总分100分，90分以上为优秀。
              </p>
            </details>
            <details className="group">
              <summary className="font-medium text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Q: 数据是否安全？
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 text-sm mt-2">
                所有推演数据均为脱敏模拟数据，不包含任何真实患者信息。数据仅在本地浏览器和服务器之间传输，不会上传到外部服务器。
              </p>
            </details>
            <details className="group">
              <summary className="font-medium text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Q: 支持 Docker 部署吗？
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 text-sm mt-2">
                是的，项目提供了 Docker 和 docker-compose 配置文件，可以一键部署后端 + 前端 + API 服务。
              </p>
            </details>
          </div>
        </section>

        {/* 联系我们 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('help.contact')}
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>
              如果您有任何问题、建议或合作意向，欢迎通过以下方式联系我们：
            </p>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-gray-700">项目主页：</span>
                <a href="#" className="text-blue-600 hover:underline ml-2">GitHub Repository</a>
              </p>
              <p>
                <span className="font-medium text-gray-700">问题反馈：</span>
                <a href="#" className="text-blue-600 hover:underline ml-2">Issue Tracker</a>
              </p>
              <p>
                <span className="font-medium text-gray-700">技术交流：</span>
                <span className="ml-2">欢迎提交 Pull Request 或参与讨论</span>
              </p>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>免责声明：</strong>本系统仅用于医院感染控制培训演练，所有数据均为脱敏模拟数据，不能用于真实临床决策。使用者需自行承担使用风险。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}