const floors = {
  F1: {
    title: "F1 入口与主通道",
    summary: "当前展示 6 个重点区域，按权重加权后的综合风险值排序。",
    areas: [
      { name: "主入口安检", baseScore: 82, weight: 1.4, note: "高客流" },
      { name: "客服中心", baseScore: 54, weight: 1.1, note: "服务密集" },
      { name: "消防通道", baseScore: 76, weight: 1.6, note: "重点区域" },
      { name: "精品零售", baseScore: 48, weight: 0.9, note: "常规区域" },
      { name: "主通道", baseScore: 66, weight: 1.3, note: "高客流" },
      { name: "地面维护", baseScore: 38, weight: 1.0, note: "常规巡检" }
    ],
    insights: [
      "消防通道与主入口权重高且得分偏高，建议优先处理。",
      "地面维护得分较低，可维持现有频次。",
      "客服中心问题集中在设备维护，建议补充巡检。"
    ]
  },
  F2: {
    title: "F2 餐饮与休闲区",
    summary: "餐饮区风险与环境卫生关联度高，权重偏重。",
    areas: [
      { name: "餐饮后厨", baseScore: 88, weight: 1.5, note: "重点区域" },
      { name: "公共就餐区", baseScore: 70, weight: 1.2, note: "高客流" },
      { name: "食品安全检查", baseScore: 92, weight: 1.7, note: "重点区域" },
      { name: "休闲座椅区", baseScore: 44, weight: 0.8, note: "常规区域" },
      { name: "垃圾回收点", baseScore: 63, weight: 1.3, note: "高客流" },
      { name: "洗手间", baseScore: 58, weight: 1.1, note: "高频使用" }
    ],
    insights: [
      "食品安全检查综合值最高，需要立刻整改。",
      "餐饮后厨问题集中在通风与消杀。",
      "休闲区风险较低，可安排重点时段巡检。"
    ]
  },
  F3: {
    title: "F3 生活方式区",
    summary: "生活方式区关注设备安全与品牌形象，权重中等偏高。",
    areas: [
      { name: "儿童游乐", baseScore: 78, weight: 1.5, note: "重点区域" },
      { name: "家居体验", baseScore: 52, weight: 1.0, note: "常规区域" },
      { name: "电梯候梯区", baseScore: 74, weight: 1.4, note: "高客流" },
      { name: "精品生活馆", baseScore: 46, weight: 0.9, note: "常规区域" },
      { name: "应急疏散", baseScore: 81, weight: 1.6, note: "重点区域" },
      { name: "空调机房", baseScore: 60, weight: 1.2, note: "设备关键" }
    ],
    insights: [
      "应急疏散与儿童游乐需加强检查频次。",
      "空调机房设备老化需列入季度专项。",
      "家居体验区风险平稳，可维持现有抽检节奏。"
    ]
  }
};

const tabButtons = document.querySelectorAll(".tab");
const grid = document.getElementById("heatmap-grid");
const floorTitle = document.getElementById("floor-title");
const floorSummary = document.getElementById("floor-summary");
const avgScore = document.getElementById("avg-score");
const highCount = document.getElementById("high-count");
const insightsList = document.getElementById("insights-list");
const weightsList = document.getElementById("weights-list");

const getHeatValue = (area) => Math.round(area.baseScore * area.weight);

const getColor = (value, min, max) => {
  const ratio = (value - min) / (max - min || 1);
  const hue = 160 - ratio * 140; // 160 green -> 20 red
  const saturation = 80;
  const lightness = 55 - ratio * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const render = (floorKey) => {
  const floor = floors[floorKey];
  if (!floor) return;

  floorTitle.textContent = floor.title;
  floorSummary.textContent = floor.summary;

  const values = floor.areas.map(getHeatValue);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const highRisk = values.filter((value) => value >= maxValue * 0.8).length;

  avgScore.textContent = avgValue;
  highCount.textContent = `${highRisk} / ${values.length}`;

  grid.innerHTML = "";
  floor.areas
    .map((area) => ({
      ...area,
      heat: getHeatValue(area)
    }))
    .sort((a, b) => b.heat - a.heat)
    .forEach((area) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      const background = getColor(area.heat, minValue, maxValue);
      cell.style.background = `linear-gradient(135deg, ${background}, #ffffff 70%)`;

      cell.innerHTML = `
        <div>
          <div class="cell__name">${area.name}</div>
          <div class="cell__meta">${area.note}</div>
        </div>
        <div>
          <div class="cell__score">${area.heat}</div>
          <div class="cell__meta">基础值 ${area.baseScore} × 权重 ${area.weight}</div>
        </div>
      `;

      grid.appendChild(cell);
    });

  insightsList.innerHTML = floor.insights.map((item) => `<li>${item}</li>`).join("");

  const topWeights = [...floor.areas]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);
  weightsList.innerHTML = topWeights
    .map(
      (area) => `
      <div class="weight-pill">
        <span>${area.name}</span>
        <strong>${area.weight.toFixed(1)}×</strong>
      </div>
    `
    )
    .join("");
};

const setActiveTab = (selected) => {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.floor === selected;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const floorKey = button.dataset.floor;
    setActiveTab(floorKey);
    render(floorKey);
  });
});

render("F1");
