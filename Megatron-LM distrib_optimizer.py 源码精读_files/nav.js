/**
 * nav.js — 全局侧边栏导航（集中管理）
 * 新增页面只需在 NAV 数组里加一条记录，所有页面自动更新。
 *
 * 用法：在 <nav class="toc"> 内放置
 *   <div id="global-nav"></div>
 *   <script src="../nav.js"></script>   ← 路径相对于页面所在目录
 */
(function () {
  /**
   * NAV 结构：
   *   { group: "分组名" }        → 渲染 toc-group 标题
   *   { label, href }            → 渲染 toc-doc 链接（href 相对于文档根目录）
   */
  var NAV = [
    { group: "入口" },
    { label: "pretrain_gpt.py",     href: "entry/pretrain_gpt.html" },
    { group: "基础设施" },
    { label: "初始化篇",            href: "infra/pretrain_and_setup.html" },
    { label: "训练循环篇",           href: "infra/training_loop.html" },
    { label: "GPU 显存计算",         href: "infra/memory_calculator.html" },
    { group: "并行策略" },
    { label: "Rank 与并行组",        href: "parallel/rank_and_parallel_groups.html" },
    { label: "集合通信操作",         href: "parallel/collective_operations.html" },
    { label: "Tensor Parallelism",   href: "parallel/tensor_parallel.html" },
    { label: "Pipeline Parallelism", href: "parallel/pipeline_parallel.html" },
    { label: "Schedule 深度精读",    href: "parallel/schedules_deep_dive.html" },
    { group: "模型架构" },
    { label: "GPT 模型架构",         href: "model/transformer_architecture.html" },
    { label: "MoE 层与 EP",          href: "model/moe_layer.html" },
    { group: "数据" },
    { label: "VPP 数据迭代器",       href: "data/vpp_data_iterator.html" },
    { group: "优化器" },
    { label: "分布式优化器",          href: "optimizer/distrib_optimizer.html" },
  ];

  // 计算文档根目录 URL（nav.js 所在目录）
  var scriptSrc = document.currentScript.src;
  var rootUrl   = scriptSrc.slice(0, scriptSrc.lastIndexOf('/') + 1);

  // 当前页面相对于根目录的路径
  var pageHref    = window.location.href.split('?')[0].split('#')[0];
  var pageRelPath = pageHref.startsWith(rootUrl) ? pageHref.slice(rootUrl.length) : '';

  // 深度 = 目录层级数，决定 "../" 前缀个数
  var depth  = (pageRelPath.match(/\//g) || []).length;
  var prefix = Array(depth + 1).join('../');

  // 生成 HTML
  var html = '<a href="' + prefix + 'index.html" class="toc-home">\u2190 \u6587\u6863\u76ee\u5f55</a>\n';

  for (var i = 0; i < NAV.length; i++) {
    var item = NAV[i];
    if (item.group) {
      html += '<div class="toc-group">' + item.group + '</div>\n';
    } else {
      var isActive = pageRelPath === item.href;
      html += '<a href="' + prefix + item.href + '" class="toc-doc'
            + (isActive ? ' active' : '') + '">' + item.label + '</a>\n';
    }
  }

  var el = document.getElementById('global-nav');
  if (el) el.innerHTML = html;
})();
