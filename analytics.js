document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
    } else {
        htmlElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});

const analyticsCap = JSON.parse(localStorage.getItem("agriArray")) || [];

const buttonSelection = document.querySelector('.button-selection');
const logsTableBody = document.querySelector('#transit-logs-body'); 

const ACTIVE_CLASSES = ['bg-emerald-600', 'text-white', 'shadow-sm'];
const INACTIVE_CLASSES = ['text-[#6b8277]', 'dark:text-slate-400', 'hover:text-[#1a241f]', 'dark:hover:text-slate-200', 'hover:bg-[#e9f0ec]', 'dark:hover:bg-slate-800'];

const btnUpdates = () => {
    if (!buttonSelection) return;
    buttonSelection.innerHTML = `
        <div class="flex items-center gap-1 overflow-x-auto custom-scroll text-xs p-1">
            <button class="px-4 py-2 font-medium rounded-lg bg-emerald-600 text-white shadow-sm transition-all whitespace-nowrap">Today</button>
            <button class="px-4 py-2 font-medium rounded-lg text-[#6b8277] dark:text-slate-400 hover:text-[#1a241f] dark:hover:text-slate-200 hover:bg-[#e9f0ec] dark:hover:bg-slate-800 transition-all whitespace-nowrap">Yesterday</button>
            <button class="px-4 py-2 font-medium rounded-lg text-[#6b8277] dark:text-slate-400 hover:text-[#1a241f] dark:hover:text-slate-200 hover:bg-[#e9f0ec] dark:hover:bg-slate-800 transition-all whitespace-nowrap">Last 7 days</button>
            <button class="px-4 py-2 font-medium rounded-lg text-[#6b8277] dark:text-slate-400 hover:text-[#1a241f] dark:hover:text-slate-200 hover:bg-[#e9f0ec] dark:hover:bg-slate-800 transition-all whitespace-nowrap">Last 30 days</button>
            <button class="px-4 py-2 font-medium rounded-lg text-[#6b8277] dark:text-slate-400 hover:text-[#1a241f] dark:hover:text-slate-200 hover:bg-[#e9f0ec] dark:hover:bg-slate-800 transition-all whitespace-nowrap">This month</button>
            <button class="px-4 py-2 font-medium rounded-lg text-[#6b8277] dark:text-slate-400 hover:text-[#1a241f] dark:hover:text-slate-200 hover:bg-[#e9f0ec] dark:hover:bg-slate-800 transition-all whitespace-nowrap">Last month</button>
        </div>`;
};

const renderLogs = (data) => {
    if (!logsTableBody) return;

    if (data.length === 0) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="py-8 text-center text-[#6b8277] dark:text-slate-400">
                    No records found for this period.
                </td>
            </tr>`;
        return;
    }

    logsTableBody.innerHTML = data.map(item => `
        <tr class="border-b border-[#e0e8e3] dark:border-slate-800/60 hover:bg-[#e9f0ec]/50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="py-3 px-3 font-mono text-emerald-600 dark:text-teal-400 font-medium whitespace-nowrap">${item.batch || 'N/A'}</td>
            <td class="py-3 px-3 text-[#1a241f] dark:text-white font-medium whitespace-nowrap">${item.supplier || 'N/A'}</td>
            <td class="py-3 px-3 text-[#6b8277] dark:text-slate-400 whitespace-nowrap">${item.date || 'N/A'}</td>
            <td class="py-3 px-3 text-right whitespace-nowrap">${Number(item.farmWeight || 0).toFixed(2)} MT</td>
            <td class="py-3 px-3 text-right whitespace-nowrap">${Number(item.millWeight || 0).toFixed(2)} MT</td>
            <td class="py-3 px-3 text-right font-semibold text-amber-500 dark:text-amber-400 whitespace-nowrap">${Number(item.calculation?.cal || 0).toFixed(2)}%</td>
        </tr>
    `).join('');
};

const dateTimeFilter = (timeframe) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(0);
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (timeframe === "Today") {
        startDate = todayStart;
    } 
    else if (timeframe === "Yesterday") {
        startDate = new Date(todayStart);
        startDate.setDate(todayStart.getDate() - 1);
        endDate = new Date(todayStart);
        endDate.setMilliseconds(-1);
    } 
    else if (timeframe === "Last 7 days") {
        startDate = new Date(todayStart);
        startDate.setDate(todayStart.getDate() - 7);
    } 
    else if (timeframe === "Last 30 days") {
        startDate = new Date(todayStart);
        startDate.setDate(todayStart.getDate() - 30);
    } 
    else if (timeframe === "This month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } 
    else if (timeframe === "Last month") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    return analyticsCap.filter(item => {
        if (!item.date) return false;
        
        const parts = item.date.split('-');
        if (parts.length !== 3) return false;
        
        const itemDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return itemDate >= startDate && itemDate <= endDate;
    });
};

const setActiveButton = (selectedBtn) => {
    if (!buttonSelection) return;
    const allButtons = buttonSelection.querySelectorAll('button');
    allButtons.forEach(btn => {
        btn.classList.remove(...ACTIVE_CLASSES);
        btn.classList.add(...INACTIVE_CLASSES);
    });
    selectedBtn.classList.remove(...INACTIVE_CLASSES);
    selectedBtn.classList.add(...ACTIVE_CLASSES);
};

if (buttonSelection) {
    buttonSelection.addEventListener('click', e => {
        e.preventDefault();
        const btn = e.target.closest('button');
        if (btn) {
            setActiveButton(btn);
            const timeframeText = btn.textContent.trim();
            const results = dateTimeFilter(timeframeText);
            renderLogs(results);
        }
    });

    btnUpdates();
    renderLogs(dateTimeFilter("Today"));
}

const analyticsFinancialLoss = document.getElementById('analytics-financial-loss');
const analyticsAvgShrinkage = document.getElementById('analytics-avg-shrinkage');
const analyticsTopShrinkageSupplier = document.getElementById('top-shrinkage-supplier');
const analyticsTotalTonnage = document.getElementById('analytics-total-tonnage');

const totalSummary = () => {
    if (analyticsFinancialLoss) {
        let totalLoss = 0;
        for (let i = 0; i < analyticsCap.length; i++) {
            totalLoss += (Number(analyticsCap[i].farmWeight) - Number(analyticsCap[i].millWeight)) * Number(analyticsCap[i].unit);
        }
        analyticsFinancialLoss.textContent = "₦ " + totalLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    if (analyticsAvgShrinkage) {
        let avg = 0;
        const dataLength = analyticsCap.length;
        for (let i = 0; i < dataLength; i++) {
            avg += Number(analyticsCap[i].calculation?.cal || 0);
        }
        analyticsAvgShrinkage.textContent = dataLength > 0 ? (avg / dataLength).toFixed(2) + " %" : "0.00 %";
    }

    if (analyticsTopShrinkageSupplier) {
        let inValue = 0;
        let supplier = '—';
        for (let i = 0; i < analyticsCap.length; i++) {
            const calVal = Number(analyticsCap[i].calculation?.cal || 0);
            if (calVal > inValue) {
                inValue = calVal;
                supplier = analyticsCap[i].supplier;
            }
        }
        analyticsTopShrinkageSupplier.textContent = supplier;
    }

    if (analyticsTotalTonnage) {
        let tonnage = 0;
        for (let i = 0; i < analyticsCap.length; i++) {
            tonnage += Number(analyticsCap[i].millWeight || 0);
        }
        analyticsTotalTonnage.textContent = tonnage.toFixed(2) + " MT";
    }
}

totalSummary();

const rankList = document.getElementById('supplier-ranking-list');

const supplierList = () => {
    if (!rankList) return;
    rankList.innerHTML = "";

    const suppliersMap = {}; 

    for (let i = 0; i < analyticsCap.length; i++) {
        const item = analyticsCap[i];
        const name = item.supplier; 

        if (!suppliersMap[name]) {
            suppliersMap[name] = {
                supplier: name,
                totalLoss: 0,
                totalTonnage: 0,
                totalShrinkage: 0,
                count: 0
            };
        }

        const lossAmt = (Number(item.farmWeight) - Number(item.millWeight)) * Number(item.unit);
        suppliersMap[name].totalLoss += isNaN(lossAmt) ? 0 : lossAmt;
        suppliersMap[name].totalTonnage += Number(item.millWeight || 0);
        suppliersMap[name].totalShrinkage += Number(item.calculation?.cal || 0);
        suppliersMap[name].count += 1;
    }

    const objItems = Object.values(suppliersMap);
    objItems.sort((a, b) => b.totalLoss - a.totalLoss);

    const maxShrinkage = objItems.length > 0 ? Math.max(...objItems.map(s => s.totalShrinkage)) : 1;

    let htmlContent = "";

    objItems.forEach((supplier, index) => {
        const rankNumber = String(index + 1).padStart(2, '0');
        const percentage = maxShrinkage > 0 ? Math.min(Math.round((supplier.totalShrinkage / maxShrinkage) * 100), 100) : 0;

        htmlContent += `
            <div class="bg-[#f9fbf9] dark:bg-slate-950/60 border border-[#e0e8e3] dark:border-slate-800/80 hover:bg-[#e9f0ec] dark:hover:bg-slate-800/50 transition-all p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
               
                <div class="flex items-center gap-4 w-full md:w-1/3">
                    <span class="text-[#6b8277] dark:text-slate-500 font-mono font-bold text-xs w-6">${rankNumber}</span>
                    <div>
                        <h4 class="text-[#1a241f] dark:text-white font-medium text-sm">${supplier.supplier}</h4>
                    </div>
                </div>

                <div class="w-full md:w-1/3">
                    <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-[#6b8277] dark:text-slate-400">Shrinkage Rate</span>
                        <span class="text-amber-600 dark:text-amber-400 font-semibold">${supplier.totalShrinkage.toFixed(2)}%</span>
                    </div>
                    <div class="w-full bg-[#e0e8e3] dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-[#d2dfd8] dark:border-slate-800">
                        <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between md:justify-end gap-8 w-full md:w-1/3 text-right">
                    <div>
                        <p class="text-[11px] text-[#6b8277] dark:text-slate-400 uppercase tracking-wider">Audited</p>
                        <p class="text-[#2d3b35] dark:text-slate-200 font-medium text-xs mt-0.5">${supplier.totalTonnage.toFixed(2)} MT</p>
                    </div>
                    <div>
                        <p class="text-[11px] text-[#6b8277] dark:text-slate-400 uppercase tracking-wider">Financial Loss</p>
                        <p class="text-rose-600 dark:text-rose-400 font-bold text-xs mt-0.5">₦ ${supplier.totalLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                </div>

            </div>
        `;
    });

    rankList.innerHTML = htmlContent;
};

const exportSuppliersToCSV = () => {
    const suppliersMap = {}; 

    for (let i = 0; i < analyticsCap.length; i++) {
        const item = analyticsCap[i];
        const name = item.supplier; 

        if (!suppliersMap[name]) {
            suppliersMap[name] = {
                supplier: name,
                totalLoss: 0,
                totalTonnage: 0,
                totalShrinkage: 0,
                count: 0
            };
        }

        const lossAmt = (Number(item.farmWeight) - Number(item.millWeight)) * Number(item.unit);
        suppliersMap[name].totalLoss += isNaN(lossAmt) ? 0 : lossAmt;
        suppliersMap[name].totalTonnage += Number(item.millWeight || 0);
        suppliersMap[name].totalShrinkage += Number(item.calculation?.cal || 0);
        suppliersMap[name].count += 1;
    }

    const suppliers = Object.values(suppliersMap);
    suppliers.sort((a, b) => b.totalLoss - a.totalLoss);

    if (suppliers.length === 0) {
        alert("No supplier data available to export.");
        return;
    }

    const headers = ["Rank", "Supplier", "Total Loss", "Audited Tonnage", "Shrinkage Rate", "Batch Count"];
    
    const rows = suppliers.map((s, index) => {
        const safeName = `"${s.supplier.replace(/"/g, '""')}"`;
        return [
            index + 1,
            safeName,
            s.totalLoss.toFixed(2),
            s.totalTonnage.toFixed(2),
            s.totalShrinkage.toFixed(2),
            s.count
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `top_shrinkage_suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

document.addEventListener('DOMContentLoaded', () => {
    supplierList();

    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSuppliersToCSV);
    }
});

function handleNewBatchSubmission(newRecord) {
    analyticsCap.push(newRecord); 
    supplierList(); 
}