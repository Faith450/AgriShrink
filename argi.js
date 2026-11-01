document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
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

const agriArray = JSON.parse(localStorage.getItem("agriArray")) || [];
let editingVal = null;


const agriSearch = () => {
    const searchInputEl = document.getElementById('agri-search');
    if (!searchInputEl) return;

    const agriItem = searchInputEl.value.toLowerCase().trim();

    const itemFilter = agriArray.filter(item => {
        const batchVal = item.batch ? item.batch.toLowerCase() : '';
        const supplierVal = item.supplier ? item.supplier.toLowerCase() : '';
        return batchVal.includes(agriItem) || supplierVal.includes(agriItem);
    });

    tableUpdates(itemFilter);
}

const searchInput = document.getElementById('agri-search');
if (searchInput) {
    searchInput.addEventListener('input', agriSearch);
}

const grossTonnage = document.getElementById('total-tonnage');
const averageShrinkageRate = document.getElementById('average-shrinkage');
const totalFinancialLoss = document.getElementById('total-financial-loss');

const cardUpdates = () => {
    if (grossTonnage) {
        let totalTon = 0;
        for (let i = 0; i < agriArray.length; i++) {
            totalTon += Number(agriArray[i].millWeight) || 0;
        }
        grossTonnage.textContent = totalTon.toFixed(2) + " MT";
    }

    if (averageShrinkageRate) {
        let averageShrink = 0;
        for (let i = 0; i < agriArray.length; i++) {
            averageShrink += Number(agriArray[i].calculation.cal) || 0;
        }
        averageShrinkageRate.textContent = agriArray.length ? ((averageShrink / agriArray.length)).toFixed(2) + " %" : "0.00 %";
    }

    if (totalFinancialLoss) {
        let loss = 0;
        for (let i = 0; i < agriArray.length; i++) {
            loss += ((Number(agriArray[i].farmWeight) - Number(agriArray[i].millWeight))) * Number(agriArray[i].unit) || 0;
        }
        totalFinancialLoss.textContent = "₦ " + loss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

const shrinkageCalculation = (farmWeight, millWeight) => {
    let totalTonnageLoss = farmWeight - millWeight;
    let shrinkagePercentage = (totalTonnageLoss / farmWeight) * 100;
    return isNaN(shrinkagePercentage) ? 0 : shrinkagePercentage;
}

const agriInput = () => {
    const unit = document.getElementById('unit-price');
    const batch = document.getElementById('batch-id');
    const supplier = document.getElementById('supplier-source');
    const batchDate = document.getElementById('batch-date');
    const departure = document.getElementById('departure-time');
    const arrival = document.getElementById('arrival-time');
    const farmWeight = document.getElementById('farm-weight');
    const millWeight = document.getElementById('mill-weight');

    const unitInput = unit.value.trim();
    const batchInput = batch.value.trim();
    const supplierInput = supplier.value.trim();
    const dateInput = batchDate.value;
    const departureInput = departure.value;
    const arrivalInput = arrival.value;
    const farmWeightInput = farmWeight.value.trim();
    const millWeightInput = millWeight.value.trim();

    unit.classList.remove('border-rose-500');
    batch.classList.remove('border-rose-500');
    supplier.classList.remove('border-rose-500');
    batchDate.classList.remove('border-rose-500');
    departure.classList.remove('border-rose-500');
    arrival.classList.remove('border-rose-500');
    farmWeight.classList.remove('border-rose-500');
    millWeight.classList.remove('border-rose-500');

    let isValid = true;
        
    if (!unitInput) { unit.classList.add('border-rose-500'); isValid = false; }
    if (!batchInput) { batch.classList.add('border-rose-500'); isValid = false; }
    if (!supplierInput) { supplier.classList.add('border-rose-500'); isValid = false; }
    if (!dateInput) { batchDate.classList.add('border-rose-500'); isValid = false; }
    if (!departureInput) { departure.classList.add('border-rose-500'); isValid = false; }
    if (!arrivalInput) { arrival.classList.add('border-rose-500'); isValid = false; }
    if (!farmWeightInput) { farmWeight.classList.add('border-rose-500'); isValid = false; }
    if (!millWeightInput) { millWeight.classList.add('border-rose-500'); isValid = false; }

    if (isValid) {
        const agriData = {
            unit: unitInput,
            batch: batchInput,
            supplier: supplierInput,
            date: dateInput,
            departure: departureInput,
            arrival: arrivalInput,
            farmWeight: parseFloat(farmWeightInput),
            millWeight: parseFloat(millWeightInput),
            calculation: {
                cal: shrinkageCalculation(parseFloat(farmWeightInput), parseFloat(millWeightInput))
            }
        }

        if (editingVal !== null) {
            agriArray[editingVal] = agriData;
            editingVal = null;
        } else {
            agriArray.push(agriData);
        }
        
        tableUpdates();

        unit.value = '';
        batch.value = '';
        supplier.value = '';
        batchDate.value = '';
        departure.value = '';
        arrival.value = '';
        farmWeight.value = '';
        millWeight.value = '';
    }
    
    return isValid;
}

const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        agriInput();
        cardUpdates();
        transitDetails();
    });
}

const tBody = document.querySelector('.table-body');

const tableUpdates = (renderSearch = agriArray) => {
    if (!tBody) return;
    tBody.innerHTML = "";
    localStorage.setItem("agriArray", JSON.stringify(agriArray));

    renderSearch.forEach((currentVal) => {
        const index = agriArray.indexOf(currentVal);

       tBody.innerHTML += `
            <tr class="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-2 font-mono text-emerald-600 dark:text-teal-400 font-medium whitespace-nowrap">${currentVal.batch}</td>
                <td class="py-3 px-2 text-[#1a241f] dark:text-white font-medium whitespace-nowrap">${currentVal.supplier}</td>
                <td class="py-3 px-2 text-[#6b8277] dark:text-slate-400 whitespace-nowrap">
                    <div class="flex flex-col text-[11px] leading-tight">
                        <span class="text-[#2d3b35] dark:text-slate-200 font-medium">${currentVal.date || 'N/A'}</span>
                        <span>Dep: ${currentVal.departure} | Arr: ${currentVal.arrival}</span>
                    </div>
                </td>
                <td class="py-3 px-2 text-right whitespace-nowrap">${currentVal.farmWeight.toFixed(2)} MT</td>
                <td class="py-3 px-2 text-right whitespace-nowrap">${currentVal.millWeight.toFixed(2)} MT</td>
                <td class="py-3 px-2 text-right font-semibold text-amber-500 dark:text-amber-400 whitespace-nowrap">${currentVal.calculation.cal.toFixed(2)}%</td>
                <td class="py-3 px-2 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                        <button data-index="${index}" class="edit-button p-1 hover:text-emerald-600 dark:hover:text-teal-400 text-[#6b8277] dark:text-slate-400 transition-colors" type="button" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                        </button>
                        <button data-index="${index}" class="delete-button p-1 hover:text-rose-600 dark:hover:text-rose-400 text-[#6b8277] dark:text-slate-400 transition-colors" type="button" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    cardUpdates();
}

if (tBody) {
    tableUpdates();
    transitDetails();

    tBody.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-button');
        const editBtn = e.target.closest('.edit-button');
        
        if (deleteBtn) {
            const deleteIndex = parseInt(deleteBtn.dataset.index);
           
            if (editingVal === deleteIndex) {
                editingVal = null;
                document.getElementById('batch-id').value = '';
                document.getElementById('supplier-source').value = '';
                document.getElementById('batch-date').value = '';
                document.getElementById('departure-time').value = '';
                document.getElementById('arrival-time').value = '';
                document.getElementById('farm-weight').value = '';
                document.getElementById('mill-weight').value = '';
            }
            agriArray.splice(deleteIndex, 1);

            tableUpdates();
            cardUpdates();
            transitDetails();
        }

        if (editBtn) {
            const editIndex = parseInt(editBtn.dataset.index);
            const toEdit = agriArray[editIndex];

            document.getElementById('batch-id').value = toEdit.batch; 
            document.getElementById('supplier-source').value = toEdit.supplier;
            document.getElementById('batch-date').value = toEdit.date || '';
            document.getElementById('departure-time').value = toEdit.departure;
            document.getElementById('arrival-time').value = toEdit.arrival;
            document.getElementById('farm-weight').value = toEdit.farmWeight;
            document.getElementById('mill-weight').value = toEdit.millWeight;
            
            editingVal = editIndex;
            document.getElementById('batch-id').focus();
        }
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editingVal !== null) {
        editingVal = null;
        const batch = document.getElementById('batch-id');
        const supplier = document.getElementById('supplier-source');
        const batchDate = document.getElementById('batch-date');
        const departure = document.getElementById('departure-time');
        const arrival = document.getElementById('arrival-time');
        const farmWeight = document.getElementById('farm-weight');
        const millWeight = document.getElementById('mill-weight');
         
        if (batch) batch.value = '';
        if (supplier) supplier.value = '';
        if (batchDate) batchDate.value = '';
        if (departure) departure.value = '';
        if (arrival) arrival.value = '';
        if (farmWeight) farmWeight.value = '';
        if (millWeight) millWeight.value = '';
        
        if (batch) batch.blur();
    }
});

function transitDetails() {
    if (agriArray.length === 0) return;

    const totalTransitTime = document.getElementById('transit-duration');
    const averageTime = document.getElementById('average-transit-time');
    const warningBadge = document.getElementById('warning-badge');
        
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 60) + minutes;
    };

    const formatTime = (totalMins) => {
        const hours = Math.floor(totalMins / 60);
        const minutes = totalMins % 60;
        return `${hours}h ${minutes}m`;
    };

    let totalTime = 0;
    let averageTotal = 0;

    if (totalTransitTime) {
        const latest = agriArray[agriArray.length - 1];
        let latestDep = timeToMinutes(latest.departure);
        let latestArr = timeToMinutes(latest.arrival);
        
        if (latestArr < latestDep) {
            latestArr += 24 * 60; 
        }
        
        totalTime = latestArr - latestDep; 
        totalTransitTime.textContent = formatTime(totalTime);
    }

    if (averageTime) {
        let timeSum = 0; 
        for (let i = 0; i < agriArray.length; i++) {
            let dep = timeToMinutes(agriArray[i].departure);
            let arr = timeToMinutes(agriArray[i].arrival);
            
            if (arr < dep) {
                arr += 24 * 60; 
            }
            
            timeSum += (arr - dep);
        }
        averageTotal = Math.round(timeSum / agriArray.length);
        averageTime.textContent = formatTime(averageTotal);
    }

    if (warningBadge) {
        if (totalTime > averageTotal) {
            warningBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-800/40";
            warningBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400"></span> Delayed';
        } else {
            warningBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-800/40";
            warningBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> On Schedule';
        }
    }
}