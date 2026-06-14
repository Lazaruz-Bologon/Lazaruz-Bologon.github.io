# arXiv 医学图像分割日报

日期：2026-06-13

## 今日筛选结果

本次检索共归档 7 篇论文，去重后全部保留，其中 4 篇为直接眼底相关，3 篇为可迁移到眼底分割的通用方法。优先级按“对眼底分割的直接价值 + 可落地性”排序。

| 序号 | 归类 | arXiv ID | 论文名 | 相关性判断 | 为什么保留 |
|---|---|---|---|---|---|
| 1 | 直接相关 | 2606.05354v1 | LightVesselNet: An Ultra-Lightweight Sub-100K Parameter Network for Retinal Blood Vessel Segmentation | 眼底血管分割，且强调端侧部署 | 与眼底血管分割直接对齐，且对移动筛查和低资源场景最实用。 |
| 2 | 直接相关 | 2605.20651v1 | Gaze into the Details: Locality-Sensitive Enhancement for OCTA Retinal Vessel Segmentation | OCTA 血管分割，关注局部低对比与细末梢 | 最接近眼底微血管细节建模，方法思路对薄血管和弱对比成像很有迁移价值。 |
| 3 | 直接相关 | 2605.10581v2 | Polygon-mamba: Retinal vessel segmentation using polygon scanning mamba and space-frequency collaborative attention | 常规彩照血管分割，强调小血管连通性 | 方法结构适合小血管连续性修复，是当前眼底分割里最值得跟踪的 Mamba 方向之一。 |
| 4 | 直接相关 | 2603.28463v2 | Decoupling Wavelet Sub-bands for Single Source Domain Generalization in Fundus Image Segmentation | 单源域泛化，面向不同相机/医院 | 对眼底 OD/OC 的跨设备迁移最直接，适合后续作为鲁棒性基线。 |
| 5 | 直接相关 | 2603.13345v1 | DDS-UDA: Dual-Domain Synergy for Unsupervised Domain Adaptation in Joint Segmentation of Optic Disc and Optic Cup | OD/OC 的跨域适配与临床落地 | 如果后续做眼底跨中心迁移，这类框架是最有参考价值的。 |
| 6 | 可迁移 | 2606.08749v1 | Active Source-free Domain Adaptation in Open-set Medical Image Segmentation via Decomposed Uncertainty and Prototype Discrepancy | 开放集、源数据不可用时的主动适配 | 对未来眼底新病灶、未知结构或无源数据迁移很有启发。 |
| 7 | 可迁移 | 2606.04705v1 | Enhancing MedSAM with a Lightweight Box Predictor for Medical Image Segmentation | SAM / MedSAM 的提示增强，适合提示不稳定的眼底目标 | 对眼底里“点提示不够准”的交互式分割很有迁移价值，但更偏方法底座。 |

## 总体判断

这批论文的主线非常清晰：一条线是围绕眼底血管/OD-OC 分割继续做轻量化、局部细节建模和跨域泛化；另一条线是把 foundation model、active learning、source-free adaptation 这些通用方法往医学分割落地。对后续眼底图像分割工作最值得优先跟踪的是轻量化部署、细血管连续性、OD/OC 跨域适配这三类问题。

## 1. LightVesselNet: An Ultra-Lightweight Sub-100K Parameter Network for Retinal Blood Vessel Segmentation

- 论文 ID: 2606.05354v1
- 归类: 直接相关
- 保留理由: 眼底血管分割，且强调端侧部署

### 背景
视网膜血管分割是糖网、青光眼等早筛的重要基础，但现有模型常因参数量大、算力需求高而不适合端侧或基层场景。

### 模型 / 算法
轻量级 encoder-decoder；MicroBlockSE 结合深度可分离卷积、SE 注意力、残差和 DropBlock；MSFA bottleneck 用并行空洞深度卷积和空间注意力提取多尺度血管。

### 训练方法
使用公开 fundus 数据集；对 DRIVE 和 FIVES 采用官方划分，对 STARE 留一法，对 CHASE DB1 做 7 折，对 HRF 做 5 折；训练在 Kaggle 的 NVIDIA T4 上完成，AdamW 优化。

### 数据来源
在 DRIVE、STARE、CHASE DB1、FIVES、HRF 上做主实验，并做跨数据集测试和消融。

### 具体创新点
把“可部署性”放到架构中心，做到约 75K 参数、约 1.4 GFLOPs，同时保留细血管边缘信息。

### 实验设计
在 DRIVE、STARE、CHASE DB1、FIVES、HRF 上做主实验，并做跨数据集测试和消融。

### 实验结果
五个数据集的 Dice 约为 0.8070/0.8072/0.8181/0.8649/0.7686，Sensitivity 约为 0.8189/0.8499/0.8640/0.8634/0.8096；跨数据集实验说明其具备较强泛化能力。

### 局限
更像“轻量血管分割基线升级版”，对跨域鲁棒性仍受数据规模限制；官方结果主要来自常见公开数据，临床异质性仍需进一步验证。

### 对眼底分割的可用性
与眼底血管分割直接对齐，且对移动筛查和低资源场景最实用。

### 审稿式判断
#### 方法优点
论文把可部署性放在中心位置，参数量和 FLOPs 都压得很低，同时还保住了细血管边缘信息。我的判断是，它的价值不只在于轻量，而在于轻量、边缘细节和跨数据集结果形成了闭环。

#### 方法缺陷
方法主要还是围绕常规 fundus 数据集上的轻量化优化，对跨设备、跨域鲁棒性的覆盖还不够重。我的判断是，如果目标是更复杂的临床域迁移，这个框架还需要额外的对齐或泛化模块。

#### 适合复现的理由
结构相对清晰，核心是轻量 encoder-decoder 加注意力、特征聚合和上采样模块，公开数据集也容易获取。我的判断是，它很适合作为眼底血管轻量化基线去复现主结果。

#### 适合改造的理由
最适合改造的是 encoder-decoder 主干与边缘残差连接，直接可以插入更强的注意力或跨域约束。我的判断是，它很适合拿去做移动筛查、低算力部署和细血管增强实验。

## 2. Gaze into the Details: Locality-Sensitive Enhancement for OCTA Retinal Vessel Segmentation

- 论文 ID: 2605.20651v1
- 归类: 直接相关
- 保留理由: OCTA 血管分割，关注局部低对比与细末梢

### 背景
OCTA 血管分割的核心难点不是全局轮廓，而是局部低对比造成的断裂和细节丢失。

### 模型 / 算法
LSENet 在 U-Net 上加入 PIE 片段注意力、MFF 多尺度特征融合、CRD 连接细化解码器。

### 训练方法
在 ROSE-1、OCTA-500、ROSSA 三个公开 OCTA 数据集上评估；采用常规图像增强和固定 patch 设置。

### 数据来源
在 ROSE-1、OCTA-500、ROSSA 三个公开 OCTA 数据集上评估；采用常规图像增强和固定 patch 设置。

### 具体创新点
把“局部区域单独看”作为设计原则，用 patch-wise attention 专门补细节，再用大卷积核修复连通性。

### 实验设计
与 9 种 SOTA 方法比较，并做模块消融和参数/FLOPs 对比。

### 实验结果
在三套数据上大多指标排名第一；例如 OCTA-500 6mm 上 Dice 92.03%、FDR 7.17%、Kappa 91.45%，ROSE-1 和 ROSSA 上也保持领先。

### 局限
提升细节时会带来一定假阳性压力，作者也明确提到更高敏感度可能牺牲部分特异性。

### 对眼底分割的可用性
最接近眼底微血管细节建模，方法思路对薄血管和弱对比成像很有迁移价值。

### 审稿式判断
#### 方法优点
论文把 OCTA 的局部低对比问题拆得很清楚，patch-wise attention、multi-scale fusion 和 connectivity refinement 分工明确。我的判断是，它的创新闭环比较完整，而且确实对细节恢复和连通性有针对性。

#### 方法缺陷
方法更偏向 OCTA 场景，跨到常规彩照时是否仍能保持同样收益并未充分证明。我的判断是，它的主要风险在于局部细节补强后带来的假阳性代价。

#### 适合复现的理由
数据集公开、模块边界明确，且主要是 U-Net 结构上的增强，工程实现难度不高。我的判断是，它是很好的 OCTA 血管分割复现对象。

#### 适合改造的理由
PIE 和 CRD 这类结构可以直接迁移到眼底细血管或模糊边界任务。我的判断是，如果想做细末梢、低对比血管增强，这篇最容易接到现有流水线里。

## 3. Polygon-mamba: Retinal vessel segmentation using polygon scanning mamba and space-frequency collaborative attention

- 论文 ID: 2605.10581v2
- 归类: 直接相关
- 保留理由: 常规彩照血管分割，强调小血管连通性

### 背景
小血管分割的主要问题是细结构断裂、局部连续性差，以及传统扫描顺序对拓扑的破坏。

### 模型 / 算法
CNN-Mamba 融合；PS-VSS 用多边形反向扫描保留连通性；SFCAM 在 skip connection 中融合空间与频域特征。

### 训练方法
在 DRIVE、STARE、CHASE DB1 上训练和测试；使用数据增强，实验环境为 RTX 4090、batch size 64、100 epochs。

### 数据来源
在 DRIVE、STARE、CHASE DB1 上训练和测试；使用数据增强，实验环境为 RTX 4090、batch size 64、100 epochs。

### 具体创新点
用 polygon scanning 替代传统横纵扫描，减少小血管拓扑破坏；再用空间-频率协同注意力抑制杂讯。

### 实验设计
做了主实验、ROC 分析、扫描策略对比和模块验证。

### 实验结果
F1 为 0.8288/0.8282/0.8251，AUC 为 0.9808/0.9840/0.9866，SE 为 0.8356/0.8314/0.8484；对小血管和边缘区表现更稳。

### 局限
作者承认混合 CNN-Mamba 会增加复杂度，而且数据量仍偏小，泛化受限；部分数据集上特异性略有下降。

### 对眼底分割的可用性
方法结构适合小血管连续性修复，是当前眼底分割里最值得跟踪的 Mamba 方向之一。

### 审稿式判断
#### 方法优点
论文把小血管拓扑保真和空间-频率协同建模结合起来，针对性很强。我的判断是，它的价值在于不只是换 backbone，而是把扫描顺序和特征抑噪都对准了小血管断裂问题。

#### 方法缺陷
混合 CNN-Mamba 方案复杂度更高，且论文自己也承认数据规模仍偏小。我的判断是，虽然提升明确，但稳定性和部署成本需要额外评估。

#### 适合复现的理由
数据集公开、评价指标清楚，核心模块是 PS-VSS 和 SFCAM，复现主线可拆解。我的判断是，它适合做为 Mamba 眼底分割方向的代表性复现。

#### 适合改造的理由
polygon scanning 和频域注意力都很适合被拆出来单独注入现有眼底分割网络。我的判断是，它特别适合进一步做拓扑保持、细血管连通性和频域去噪的改造。

## 4. Decoupling Wavelet Sub-bands for Single Source Domain Generalization in Fundus Image Segmentation

- 论文 ID: 2603.28463v2
- 归类: 直接相关
- 保留理由: 单源域泛化，面向不同相机/医院

### 背景
同一模型在不同医院、设备和成像条件下容易掉点，尤其是 OD/OC 的边界和形态泛化。

### 模型 / 算法
WaveSDG 以 ResNet18 为编码器，在 skip connection 中插入 WISER，将 wavelet 子带按语义功能分解并选择性增强。

### 训练方法
源域用 REFUGE（1200 张）训练，目标域覆盖 Drishti-GS、Gamma 和 Chaksu 的 Bosch/Forus/Remidio 子域；输入统一到 512x512，batch size 8。

### 数据来源
源域用 REFUGE（1200 张）训练，目标域覆盖 Drishti-GS、Gamma 和 Chaksu 的 Bosch/Forus/Remidio 子域；输入统一到 512x512，batch size 8。

### 具体创新点
把 wavelet 子带当作“结构/边缘/噪声”的不同语义通道来处理，而不是把全部频带一视同仁。

### 实验设计
在一个源域和五个未见目标域上做 SDG 对比，报告 DSC、HD95、MMD、JSD 和 Fréchet Distance，并做 WISER 与 deep supervision 的消融。

### 实验结果
在多个未见目标域上持续取得更好的 balanced Dice 和更低 HD95，尤其对 OC 分割更稳，结构边界更清晰。

### 局限
这是单源泛化设定，仍依赖训练源域覆盖度；wavelet 结构带来额外设计复杂度，跨任务验证还不够宽。

### 对眼底分割的可用性
对眼底 OD/OC 的跨设备迁移最直接，适合后续作为鲁棒性基线。

### 审稿式判断
#### 方法优点
论文把 wavelet 子带按结构、边缘和噪声语义去分解，方向非常明确。我的判断是，它最大的优点是把单源域泛化里最难的“外观变化”拆成了可操作的频域组件。

#### 方法缺陷
它仍然依赖源域覆盖度，且 wavelet 设计增加了模型的结构复杂性。我的判断是，如果目标域偏移超出源域多样性，单靠这个模块还不够。

#### 适合复现的理由
源域和多个未见目标域都公开可获取，WISER 的设计边界清晰，比较适合复现。我的判断是，它特别适合作为眼底跨设备泛化的基线增强。

#### 适合改造的理由
WISER 很适合被改造成更通用的边界/结构分离模块。我的判断是，如果后续做 OD/OC 泛化或跨相机鲁棒性，这一套设计很值得继续延伸。

## 5. DDS-UDA: Dual-Domain Synergy for Unsupervised Domain Adaptation in Joint Segmentation of Optic Disc and Optic Cup

- 论文 ID: 2603.13345v1
- 归类: 直接相关
- 保留理由: OD/OC 的跨域适配与临床落地

### 背景
OD/OC 分割在跨设备、跨中心部署时会明显掉点，而标注又昂贵，UDA 是现实路径。

### 模型 / 算法
teacher-student UDA；双向跨域一致性正则抑制 domain interference；频率驱动的域内伪标签学习增强泛化。

### 训练方法
使用 Fundus 多域数据集，域包含 Drishti-GS、RIM-ONE-r3、REFUGE(train)、REFUGE(val)；在 RIGA+ 上做额外验证。

### 数据来源
使用 Fundus 多域数据集，域包含 Drishti-GS、RIM-ONE-r3、REFUGE(train)、REFUGE(val)；在 RIGA+ 上做额外验证。

### 具体创新点
把“跨域一致性”与“域内伪标签”放在一个统一框架里，并用动态 mask 和频域监督减少噪声传播。

### 实验设计
在 Fundus 和 RIGA+ 上分别做多场景 UDA，对比 Source-only、Target-only 和多种 UDA baseline，并做模块消融。

### 实验结果
整体优于多种现有 UDA 方法；在 RIGA+ 上大多数情形下 Dice 和 HD 都更好，仅个别 OD 场景较 TriLA 略低。

### 局限
标准 UDA 仍依赖可访问源数据；对某些场景的 OD 指标并非全面碾压，说明模块之间的平衡还可继续调。

### 对眼底分割的可用性
如果后续做眼底跨中心迁移，这类框架是最有参考价值的。

### 审稿式判断
#### 方法优点
论文把跨域一致性和域内伪标签学习放进一个统一框架，teacher-student 结构也比较稳。我的判断是，它对 OD/OC 这种跨中心部署问题给出了一条完整、可讲清楚的 UDA 路线。

#### 方法缺陷
标准 UDA 仍然依赖源域可访问，且不同子模块之间的平衡会影响最终表现。我的判断是，这类方法最难的地方不是有没有提升，而是提升是否在所有域上都稳定。

#### 适合复现的理由
公开数据和对比方法都比较齐全，整体结构也清晰，适合复现主结果。我的判断是，它是眼底跨域适配里比较标准的一条 teacher-student 基线。

#### 适合改造的理由
动态 mask、频域监督和伪标签学习都可以拆出来注入现有眼底分割流水线。我的判断是，它很适合继续做跨中心、跨设备和弱监督增强。

## 6. Active Source-free Domain Adaptation in Open-set Medical Image Segmentation via Decomposed Uncertainty and Prototype Discrepancy

- 论文 ID: 2606.08749v1
- 归类: 可迁移
- 保留理由: 开放集、源数据不可用时的主动适配

### 背景
临床迁移时常见问题是：源数据不可用，目标域还可能出现源域没有的新类别。

### 模型 / 算法
ASFOSDA 以 active learning 选择目标样本；CDU 评估 class-aware uncertainty，CPD 用 prototype discrepancy 选代表性样本；再用 target-refined self-training。

### 训练方法
在 MSD Spleen、FLARE、AMOS CT、AMOS MR 等 3D 分割任务上训练；使用 3D U-Net 和 SwinUNETR，Dice+CE 损失，source 预训练后在 target 侧自适应。

### 数据来源
在 MSD Spleen、FLARE、AMOS CT、AMOS MR 等 3D 分割任务上训练；使用 3D U-Net 和 SwinUNETR，Dice+CE 损失，source 预训练后在 target 侧自适应。

### 具体创新点
同时解决 source-free 和 open-set 两个难点，用“先挑样本，再伪标注”的策略减少标注需求。

### 实验设计
做三套数据上的主动查询、伪标签和消融分析，并和 Source-only、ASFDA 等基线比较。

### 实验结果
整体优于现有方法，作者报告 U-Net 和 Swin UNETR 在主动自适应后能达到接近上界的性能比例。

### 局限
这是通用 3D 医学分割，不是眼底任务；主动查询仍需要人工标注预算，且开放集设定对类定义依赖高。

### 对眼底分割的可用性
对未来眼底新病灶、未知结构或无源数据迁移很有启发。

### 审稿式判断
#### 方法优点
论文同时处理 source-free、open-set 和 active learning 三个难点，问题定义很完整。我的判断是，它最强的地方是把目标样本选择和伪标签学习放进同一条自适应链路里。

#### 方法缺陷
这是一篇通用 3D 医学分割方法，不是眼底专用方案，而且主动查询仍然要消耗人工预算。我的判断是，它的开放集假设和真实眼底病灶定义之间还有差距。

#### 适合复现的理由
组件化清楚，测试时增强、prototype discrepancy 和 self-training 都比较独立，复现主线不算模糊。我的判断是，它适合在无源迁移和新结构迁移场景下做方法复核。

#### 适合改造的理由
最适合改造成眼底新病灶、未知结构和无源数据迁移的主动选择器。我的判断是，如果后续做新病种或隐私受限场景，这篇非常值得移植。

## 7. Enhancing MedSAM with a Lightweight Box Predictor for Medical Image Segmentation

- 论文 ID: 2606.04705v1
- 归类: 可迁移
- 保留理由: SAM / MedSAM 的提示增强，适合提示不稳定的眼底目标

### 背景
SAM/MedSAM 在医学图像上常被 prompt 质量限制，单点提示对小、弱对比、边界模糊目标尤其不稳。

### 模型 / 算法
在 MedSAM 上加轻量 Box Predictor，从单点估计粗框，再把框作为额外空间先验输入；Box Predictor 只增加约 1.6M 参数。

### 训练方法
Box Predictor 先单独训练，再与 MedSAM 组合；在 FLARE22、BRISC、BUSI、LungSegDB 上验证。

### 数据来源
Box Predictor 先单独训练，再与 MedSAM 组合；在 FLARE22、BRISC、BUSI、LungSegDB 上验证。

### 具体创新点
把 prompt 从“单点”升级为“点到框”的两阶段空间引导，减少 prompt 歧义。

### 实验设计
比较 point、box、hybrid 及冻结/微调配置，并做点偏移、框扩张比例和 patch size 消融。

### 实验结果
相对 baseline MedSAM 在多数据集上提升稳定性和精度，对 off-center click 更鲁棒。

### 局限
作者明确指出，单点仍然无法表达多个离散目标；当目标本身非常清晰时，额外框反而可能带来干扰。

### 对眼底分割的可用性
对眼底里“点提示不够准”的交互式分割很有迁移价值，但更偏方法底座。

## 领域进展速览

1. 轻量化仍然是眼底血管分割的重要方向，尤其适合移动筛查和边缘设备。
2. 局部低对比、细末梢断裂和边缘不连续，仍然是 OCTA 和常规 fundus 的主难点。
3. OD/OC 分割的趋势已经从“单域最好”转向“跨域稳定”，WaveSDG 和 DDS-UDA 是这一变化的代表。
4. SAM / MedSAM、active learning、source-free / open-set adaptation 的价值在于补齐提示、标注和域迁移三个薄弱环节。

## 归档说明

原始论文 PDF 与解析文本已按日期和文献名归档到 reference/2026-06-13/<paper-name>/paper.pdf，同时保留了 metadata.json、abstract.txt 和 fulltext.txt。
本报告对应的 Markdown、HTML 和 PDF 已保存在同一日期目录。

### 审稿式判断
#### 方法优点
论文抓住了 prompt 质量不足这个真实痛点，用一个轻量 box predictor 把单点提示扩展成更稳定的空间先验。我的判断是，它的创新不大但很实用，工程上很好落地。

#### 方法缺陷
它依赖单点输入的稳定性，也可能在非常清晰的目标上引入额外干扰。我的判断是，这类方法更像补丁而不是完整的分割系统。

#### 适合复现的理由
模块非常清楚，Box Predictor 可以独立训练再接回 MedSAM，复现门槛相对低。我的判断是，它适合当作提示增强底座复现。

#### 适合改造的理由
最适合直接迁移到眼底交互式分割，尤其是点提示不够准、目标边界模糊的场景。我的判断是，它很适合与眼底前景定位或框提示结合。
