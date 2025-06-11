const BASE_URL = 'http://localhost:3001';
let USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)
let selectedServer = null;
let selectedCharacter = null;
let selectedDbName = null;
let selectedCharacterId = null; // 선택된 캐릭터의 ID를 저장할 변수

// Tab elements
const tabServerCharBtn = document.getElementById('tab-server-char');
const tabInventoryBtn = document.getElementById('tab-inventory');
const tabCollectionItemsBtn = document.getElementById('tab-collection-items');
const tabQuestsBtn = document.getElementById('tab-quests');
const tabCharacterTasksBtn = document.getElementById('tab-character-tasks'); // New tab button
const tabResourcesBtn = document.getElementById('tab-resources'); // New resource tab button
const tabLifeSkillsBtn = document.getElementById('tab-life-skills'); // New life skill tab button

const tabContentServerChar = document.getElementById('tab-content-server-char');
const tabContentInventory = document.getElementById('tab-content-inventory');
const tabContentCollectionItems = document.getElementById('tab-content-collection-items');
const tabContentQuests = document.getElementById('tab-content-quests');
const tabContentCharacterTasks = document.getElementById('tab-content-character-tasks'); // New tab content
const tabContentResources = document.getElementById('tab-content-resources'); // New resource tab content
const tabContentLifeSkills = document.getElementById('tab-content-life-skills'); // New life skill tab content
const collectionItemsTableBody = document.getElementById('collectionItemsTableBody');

const serverSelect = document.getElementById('serverSelect');
const characterInput1 = document.getElementById('characterNameInput1');
const characterInput2 = document.getElementById('characterNameInput2');
const characterInput3 = document.getElementById('characterNameInput3');
const characterInput4 = document.getElementById('characterNameInput4');
const saveCharactersBtn = document.getElementById('saveCharactersBtn');
const loadCharactersBtn = document.getElementById('loadCharactersBtn');
const currentSelectionText = document.getElementById('currentSelection');
const inventoryTableBody = document.querySelector('#inventoryTable tbody');
const refreshCraftableButton = document.getElementById('refreshCraftable');
const craftableListContainer = document.getElementById('craftableList');
const currentInventorySelectionText = document.getElementById('currentInventorySelection');
const dailyQuestsTableBody = document.getElementById('dailyQuestsTableBody');
const weeklyQuestsTableBody = document.getElementById('weeklyQuestsTableBody');
const resetDailyQuestsBtn = document.getElementById('resetDailyQuestsBtn');
const resetWeeklyQuestsBtn = document.getElementById('resetWeeklyQuestsBtn');

const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const characterTasksTable = document.getElementById('characterTasksTable');
const characterTasksTableBody = document.getElementById('characterTasksTableBody');

// Resource elements
const silverCoinsCurrent = document.getElementById('silverCoinsCurrent');
const silverCoinsTimeToFull = document.getElementById('silverCoinsTimeToFull');
const silverCoinsChangeInput = document.getElementById('silverCoinsChangeInput');
const addSilverCoinsBtn = document.getElementById('addSilverCoinsBtn');
const useSilverCoinsBtn = document.getElementById('useSilverCoinsBtn');

const demonTributeCurrent = document.getElementById('demonTributeCurrent');
const demonTributeTimeToFull = document.getElementById('demonTributeTimeToFull');
const demonTributeChangeInput = document.getElementById('demonTributeChangeInput');
const addDemonTributeBtn = document.getElementById('addDemonTributeBtn');
const useDemonTributeBtn = document.getElementById('useDemonTributeBtn');

// Life skill elements
const currentLifeSkillsSelection = document.getElementById('currentLifeSkillsSelection');
const lifeSkillsGrid = document.getElementById('lifeSkillsGrid');

let allCharacters = []; // 서버에서 로드된 모든 캐릭터를 ID와 함께 저장

// Function to show a specific tab
function showTab(tabContentId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    // Deactivate all tab buttons
    document.querySelectorAll('button[id^="tab-"]').forEach(btn => {
        btn.classList.remove('text-blue-700', 'border-blue-700');
        btn.classList.add('text-gray-500', 'hover:text-blue-700');
    });

    // Show the selected tab content
    document.getElementById(tabContentId).classList.remove('hidden');
    // Activate the corresponding tab button
    if (tabContentId === 'tab-content-server-char') {
        tabServerCharBtn.classList.add('text-blue-700', 'border-blue-700');
        tabServerCharBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-inventory') {
        tabInventoryBtn.classList.add('text-blue-700', 'border-blue-700');
        tabInventoryBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-collection-items') {
        tabCollectionItemsBtn.classList.add('text-blue-700', 'border-blue-700');
        tabCollectionItemsBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-quests') {
        tabQuestsBtn.classList.add('text-blue-700', 'border-blue-700');
        tabQuestsBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-character-tasks') { // New tab
        tabCharacterTasksBtn.classList.add('text-blue-700', 'border-blue-700');
        tabCharacterTasksBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-resources') { // New resource tab
        tabResourcesBtn.classList.add('text-blue-700', 'border-blue-700');
        tabResourcesBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    } else if (tabContentId === 'tab-content-life-skills') { // New life skill tab
        tabLifeSkillsBtn.classList.add('text-blue-700', 'border-blue-700');
        tabLifeSkillsBtn.classList.remove('text-gray-500', 'hover:text-blue-700');
    }
}

// Event listeners for tab buttons
tabServerCharBtn.addEventListener('click', () => showTab('tab-content-server-char'));
tabInventoryBtn.addEventListener('click', () => {
    console.log('tabInventoryBtn 클릭 이벤트 리스너 시작');
    showTab('tab-content-inventory');
    console.log('showTab 호출 완료, loadInventory 호출 전');
    loadInventory(); // 탭 이동 시 인벤토리 새로고침
    console.log('loadInventory 호출 완료');
});
tabCollectionItemsBtn.addEventListener('click', () => {
    showTab('tab-content-collection-items');
    loadCollectionItems();
});
tabQuestsBtn.addEventListener('click', () => {
    showTab('tab-content-quests');
    loadDailyQuests();
    loadWeeklyQuests();
});
tabCharacterTasksBtn.addEventListener('click', () => { // New tab event listener
    showTab('tab-content-character-tasks');
    loadCharactersAndTasks(); // 모든 캐릭터의 작업 로드 - 서버 선택 없이 바로 호출
});
tabResourcesBtn.addEventListener('click', () => {
    showTab('tab-content-resources');
    loadUserResources(); // 재화 정보 로드
});
tabLifeSkillsBtn.addEventListener('click', () => {
    showTab('tab-content-life-skills');
    loadLifeSkills(); // 생활스킬 정보 로드
});

// 서버 목록 로드
async function loadServers() {
    try {
        const res = await fetch(`${BASE_URL}/servers`);
        const servers = await res.json();
        serverSelect.innerHTML = '<option value="">서버를 선택하세요</option>'; // 기존 옵션 초기화
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.name;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });
    } catch (error) {
        console.error('서버 로드 중 오류 발생:', error);
    }
}

// 캐릭터 목록 로드 및 입력 필드 채우기
async function loadCharacters() {
    if (!selectedServer) {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`characterNameInput${i}`).value = '';
        }
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/characters/${USER_ID}/server/${selectedServer}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const characters = await response.json();
        allCharacters = characters; // 전역 allCharacters 업데이트

        // 입력 필드 초기화
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`characterNameInput${i}`).value = '';
        }

        // 불러온 캐릭터 이름으로 입력 필드 채우기
        characters.slice(0, 4).forEach((char, index) => {
            document.getElementById(`characterNameInput${index + 1}`).value = char.character_name;
        });

        // 캐릭터를 자동으로 선택하는 로직 제거
        selectedCharacter = null;
        selectedCharacterId = null;
        selectedDbName = null;
        currentSelectionText.textContent = `선택된 서버: ${selectedServer}, 캐릭터: 없음`;
        currentInventorySelectionText.textContent = `선택된 서버: ${selectedServer}, 캐릭터: 없음`;
        currentLifeSkillsSelection.textContent = `선택된 서버: ${selectedServer}, 캐릭터: 없음`;

    } catch (error) {
        console.error('캐릭터 로드 중 오류 발생:', error);
        alert('캐릭터를 불러오는 데 실패했습니다.');
    }
}

// 캐릭터 저장
async function saveCharacters() {
    if (!selectedServer) {
        alert('캐릭터를 저장하려면 먼저 서버를 선택해야 합니다.');
        return;
    }

    const characterNames = [];
    for (let i = 1; i <= 4; i++) {
        const name = document.getElementById(`characterNameInput${i}`).value.trim();
        if (name) {
            characterNames.push(name);
        }
    }

    if (characterNames.length === 0) {
        alert('저장할 캐릭터 이름을 최소 하나 이상 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/characters/${USER_ID}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                server_name: selectedServer,
                character_names: characterNames
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '캐릭터 저장에 실패했습니다.');
        }

        alert('캐릭터가 성공적으로 저장되었습니다.');
        loadCharacters(); // 저장 후 캐릭터 목록 새로고침

    } catch (error) {
        console.error('캐릭터 저장 중 오류 발생:', error);
        alert(`캐릭터 저장 실패: ${error.message}`);
    }
}

// 캐릭터 선택 (입력 필드 기반으로 업데이트)
function selectCharacter(characterName, dbName, characterId) {
    selectedCharacter = characterName;
    selectedDbName = dbName; // 선택된 데이터베이스 이름 저장
    selectedCharacterId = characterId; // 선택된 캐릭터의 ID 저장
    currentSelectionText.textContent = `선택된 서버: ${selectedServer}, 캐릭터: ${selectedCharacter}`;
    currentInventorySelectionText.textContent = `선택된 서버: ${selectedServer}, 캐릭터: ${selectedCharacter}`;
    currentLifeSkillsSelection.textContent = `선택된 서버: ${selectedServer}, 캐릭터: ${selectedCharacter}`;

    // 모든 '선택' 버튼의 배경색을 초기화
    document.querySelectorAll('.select-active-char-btn').forEach(btn => {
        btn.classList.remove('bg-purple-700');
        btn.classList.add('bg-purple-500');
    });

    // 현재 선택된 캐릭터의 버튼 배경색 변경
    const selectedButton = document.querySelector(`.select-active-char-btn[data-char-index="${[
        characterInput1, characterInput2, characterInput3, characterInput4
    ].findIndex(input => input.value === characterName) + 1}"]`);
    if (selectedButton) {
        selectedButton.classList.remove('bg-purple-500');
        selectedButton.classList.add('bg-purple-700');
    }
}

// 서버 선택 변경 시 이벤트
serverSelect.addEventListener('change', (event) => {
    selectedServer = event.target.value;
    if (selectedServer) {
        loadCharacters(); // 서버 변경 시 캐릭터 목록 새로고침
    } else {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`characterNameInput${i}`).value = '';
        }
        selectedCharacter = null;
        selectedDbName = null;
        selectedCharacterId = null;
    }
    currentSelectionText.textContent = `선택된 서버: ${selectedServer || '없음'}, 캐릭터: ${selectedCharacter || '없음'}`;
    currentInventorySelectionText.textContent = `선택된 서버: ${selectedServer || '없음'}, 캐릭터: ${selectedCharacter || '없음'}`;
    currentLifeSkillsSelection.textContent = `선택된 서버: ${selectedServer || '없음'}, 캐릭터: ${selectedCharacter || '없음'}`;
});

// 이벤트 리스너 연결
saveCharactersBtn.addEventListener('click', saveCharacters);
loadCharactersBtn.addEventListener('click', loadCharacters);

// 각 "선택" 버튼에 이벤트 리스너 추가
document.querySelectorAll('.select-active-char-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        if (!selectedServer) {
            alert('캐릭터를 선택하려면 먼저 서버를 선택해야 합니다.');
            return;
        }
        const charIndex = event.target.dataset.charIndex;
        const characterName = document.getElementById(`characterNameInput${charIndex}`).value.trim();

        if (!characterName) {
            alert('선택할 캐릭터 이름을 입력해주세요.');
            return;
        }

        const selectedCharData = allCharacters.find(char => char.character_name === characterName);

        if (selectedCharData) {
            selectCharacter(selectedCharData.character_name, selectedCharData.db_name, selectedCharData.character_id);
            // 탭 변경 로직은 필요에 따라 추가 (예: 아이템 관리 탭으로 자동 이동)
            // tabInventoryBtn.click(); // 선택 후 아이템 관리 탭으로 이동
        } else {
            alert('존재하지 않는 캐릭터 이름입니다. 먼저 저장해주세요.');
        }
    });
});

// 채집 아이템 정보 로드
async function loadCollectionItems() {
    try {
        const response = await fetch(`${BASE_URL}/items`);
        const items = await response.json();
        const tableBody = document.getElementById('collectionItemsTableBody');
        tableBody.innerHTML = ''; // 기존 내용 지우기
        items.filter(item => item.category === '나무 베기' || item.category === '광석 캐기' || item.category === '약초 채집' || item.category === '양털 깎기' || item.category === '호미질' || item.category === '곤충 채집' || item.category === '낚시 채집' || item.category === '일상 채집' || item.category === '곡물 추수').forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="px-2 py-1 border-b">${item.name}</td>
                <td class="px-2 py-1 border-b">${item.category}</td>
                <td class="px-2 py-1 border-b">${item.collection_target || 'N/A'}</td>
                <td class="px-2 py-1 border-b">${item.required_level !== null ? item.required_level : 'N/A'}</td>
                <td class="px-2 py-1 border-b">${item.usage_details || 'N/A'}</td>
            `;
        });
    } catch (error) {
        console.error('채집 아이템 로드 중 오류 발생:', error);
    }
}

// 일일 숙제 로드
async function loadDailyQuests() {
    try {
        const response = await fetch(`${BASE_URL}/quests/daily/${USER_ID}`);
        const quests = await response.json();
        dailyQuestsTableBody.innerHTML = '';
        quests.forEach(quest => {
            const row = dailyQuestsTableBody.insertRow();
            row.innerHTML = `
                <td class="px-2 py-1 border-b">${quest.quest_name}</td>
                <td class="px-2 py-1 border-b">${quest.quest_description}</td>
                <td class="px-2 py-1 border-b">
                    <input type="checkbox" data-id="${quest.id}" ${quest.is_completed ? 'checked' : ''} onchange="toggleQuestCompletion(this.dataset.id, this.checked, 'daily')" class="w-5 h-5">
                </td>
            `;
        });
    } catch (error) {
        console.error('일일 숙제 로드 중 오류 발생:', error);
    }
}

// 주간 숙제 로드
async function loadWeeklyQuests() {
    try {
        const response = await fetch(`${BASE_URL}/quests/weekly/${USER_ID}`);
        const quests = await response.json();
        weeklyQuestsTableBody.innerHTML = '';
        quests.forEach(quest => {
            const row = weeklyQuestsTableBody.insertRow();
            row.innerHTML = `
                <td class="px-2 py-1 border-b">${quest.quest_name}</td>
                <td class="px-2 py-1 border-b">${quest.quest_description}</td>
                <td class="px-2 py-1 border-b">
                    <input type="checkbox" data-id="${quest.id}" ${quest.is_completed ? 'checked' : ''} onchange="toggleQuestCompletion(this.dataset.id, this.checked, 'weekly')" class="w-5 h-5">
                </td>
            `;
        });
    } catch (error) {
        console.error('주간 숙제 로드 중 오류 발생:', error);
    }
}

// 숙제 완료 상태 토글
async function toggleQuestCompletion(questId, isCompleted, type) {
    try {
        await fetch(`${BASE_URL}/quests/${type}/${USER_ID}/${questId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_completed: isCompleted })
        });
        if (type === 'daily') loadDailyQuests();
        else if (type === 'weekly') loadWeeklyQuests();
    } catch (error) {
        console.error('숙제 완료 상태 업데이트 중 오류 발생:', error);
        alert('숙제 상태 업데이트에 실패했습니다.');
    }
}

// 일일 숙제 초기화 버튼 이벤트
resetDailyQuestsBtn.addEventListener('click', async () => {
    if (confirm('오늘의 일일 숙제를 모두 초기화하시겠습니까? 완료 상태가 모두 해제됩니다.')) {
        try {
            await fetch(`${BASE_URL}/quests/daily/${USER_ID}/reset`, {
                method: 'PUT'
            });
            alert('일일 숙제가 초기화되었습니다.');
            loadDailyQuests();
        } catch (error) {
            console.error('일일 숙제 초기화 중 오류 발생:', error);
            alert('일일 숙제 초기화에 실패했습니다.');
        }
    }
});

// 주간 숙제 초기화 버튼 이벤트
resetWeeklyQuestsBtn.addEventListener('click', async () => {
    if (confirm('이번 주의 주간 숙제를 모두 초기화하시겠습니까? 완료 상태가 모두 해제됩니다.')) {
        try {
            await fetch(`${BASE_URL}/quests/weekly/${USER_ID}/reset`, {
                method: 'PUT'
            });
            alert('주간 숙제가 초기화되었습니다.');
            loadWeeklyQuests();
        } catch (error) {
            console.error('주간 숙제 초기화 중 오류 발생:', error);
            alert('주간 숙제 초기화에 실패했습니다.');
        }
    }
});

async function loadTasks() {
    try {
        const response = await fetch(`${BASE_URL}/tasks`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('작업 로드 중 오류 발생:', error);
        return [];
    }
}

async function loadCharacterTaskStatuses(characterId) {
    try {
        const response = await fetch(`${BASE_URL}/tasks/character/${characterId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('캐릭터 작업 상태 로드 중 오류 발생:', error);
        return [];
    }
}

async function loadAllCharacters() {
    try {
        const response = await fetch(`${BASE_URL}/servers/all-characters`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('모든 캐릭터 로드 중 오류 발생:', error);
        return [];
    }
}

async function loadCharactersAndTasks() { // Removed serverName parameter
    try {
        const allTasks = await loadTasks();
        const characters = await loadAllCharacters(); // Fetch all characters

        const tasksData = [];

        for (const character of characters) {
            const characterTaskStatuses = await loadCharacterTaskStatuses(character.character_id);
            allTasks.forEach(task => {
                const status = characterTaskStatuses.find(cts => cts.task_id === task.id);
                tasksData.push({
                    taskId: task.id,
                    taskName: task.task_name,
                    characterId: character.character_id,
                    characterName: character.character_name,
                    serverName: characters.find(c => c.character_id === character.character_id)?.server_name, // Assuming server_name is part of character object
                    isCompleted: status ? status.is_completed : false
                });
            });
        }
        renderCharacterTasksTable(tasksData, characters);
    } catch (error) {
        console.error('캐릭터 및 작업 로드 중 오류 발생:', error);
    }
}

function renderCharacterTasksTable(tasksData, characters) {
    const tableBody = characterTasksTableBody;
    tableBody.innerHTML = '';

    // Get unique tasks and sort them
    const uniqueTasks = Array.from(new Set(tasksData.map(task => task.taskName)))
        .map(taskName => tasksData.find(task => task.taskName === taskName))
        .sort((a, b) => a.taskName.localeCompare(b.taskName));

    uniqueTasks.forEach(task => {
        const taskRow = document.createElement('tr');
        taskRow.innerHTML = `
            <td class="px-2 py-1 border-b font-semibold">${task.taskName}</td>
            <td class="px-2 py-1 border-b"></td>
            <td class="px-2 py-1 border-b"></td>
            <td class="px-2 py-1 border-b"></td>
        `;
        tableBody.appendChild(taskRow);

        // Filter tasks for the current task name and sort by character name
        const characterSpecificTasks = tasksData.filter(t => t.taskName === task.taskName)
            .sort((a, b) => a.characterName.localeCompare(b.characterName));

        characterSpecificTasks.forEach(charTask => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="px-2 py-1 border-b"></td>
                <td class="px-2 py-1 border-b">${charTask.serverName || 'N/A'}</td>
                <td class="px-2 py-1 border-b">${charTask.characterName}</td>
                <td class="px-2 py-1 border-b">
                    <input type="checkbox" data-task-id="${charTask.taskId}" data-character-id="${charTask.characterId}" ${charTask.isCompleted ? 'checked' : ''} onchange="toggleCharacterTaskCompletion(this.dataset.taskId, this.dataset.characterId, this.checked)" class="w-5 h-5">
                </td>
            `;
        });
    });
}

async function toggleCharacterTaskCompletion(taskId, characterId, isCompleted) {
    try {
        await fetch(`${BASE_URL}/tasks/character/${characterId}/${taskId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_completed: isCompleted })
        });
        loadCharactersAndTasks(); // Refresh display
    } catch (error) {
        console.error('캐릭터 작업 완료 상태 업데이트 중 오류 발생:', error);
        alert('작업 상태 업데이트에 실패했습니다.');
    }
}

// Add new task
addTaskBtn.addEventListener('click', async () => {
    const taskName = newTaskInput.value.trim();
    if (taskName) {
        try {
            const response = await fetch(`${BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_name: taskName })
            });
            if (response.ok) {
                newTaskInput.value = '';
                loadCharactersAndTasks();
            } else {
                alert('작업 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('새 작업 추가 중 오류 발생:', error);
            alert('새 작업 추가 중 오류가 발생했습니다.');
        }
    } else {
        alert('작업 이름을 입력해주세요.');
    }
});

// Load inventory items for selected character (needs selectedCharacterId to be set)
async function loadInventory() {
    if (!selectedCharacterId) {
        inventoryTableBody.innerHTML = '<tr><td colspan="3" class="px-2 py-1 text-center text-gray-500">캐릭터를 선택해주세요.</td></tr>';
        craftableListContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/items/user-inventory?userId=${USER_ID}&characterId=${selectedCharacterId}`); // Pass characterId
        const items = await response.json();

        inventoryTableBody.innerHTML = ''; // Clear existing content
        if (items.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="3" class="px-2 py-1 text-center text-gray-500">인벤토리에 아이템이 없습니다.</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = inventoryTableBody.insertRow();
            row.innerHTML = `
                <td class="px-2 py-1 border-b">${item.name}</td>
                <td class="px-2 py-1 border-b">
                    <input type="number" value="${item.quantity}" 
                           data-item-id="${item.item_id}" 
                           onchange="updateItemQuantity(this.dataset.itemId, this.value)" 
                           class="shadow appearance-none border rounded w-24 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </td>
                <td class="px-2 py-1 border-b">
                    <button onclick="removeItemFromInventory(${item.item_id})" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">삭제</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('인벤토리 로드 중 오류 발생:', error);
        inventoryTableBody.innerHTML = '<tr><td colspan="3" class="px-2 py-1 text-center text-red-500">인벤토리 로드에 실패했습니다.</td></tr>';
    }
}

async function updateItemQuantity(itemId, quantity) {
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
        alert('수량은 0 이상이어야 합니다.');
        loadInventory(); // Revert to original quantity
        return;
    }
    try {
        await fetch(`${BASE_URL}/items/update-quantity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item_id: itemId, quantity: newQuantity })
        });
        loadInventory(); // Refresh inventory display
    } catch (error) {
        console.error('아이템 수량 업데이트 중 오류 발생:', error);
        alert('아이템 수량 업데이트에 실패했습니다.');
    }
}

async function removeItemFromInventory(itemId) {
    if (confirm('정말로 이 아이템을 인벤토리에서 삭제하시겠습니까?')) {
        try {
            await fetch(`${BASE_URL}/items/user-inventory/${USER_ID}/${itemId}`, {
                method: 'DELETE'
            });
            loadInventory(); // Refresh inventory display
        } catch (error) {
            console.error('아이템 삭제 중 오류 발생:', error);
            alert('아이템 삭제에 실패했습니다.');
        }
    }
}

// Load craftable items
refreshCraftableButton.addEventListener('click', async () => {
    if (!selectedCharacterId) {
        alert('캐릭터를 먼저 선택해주세요.');
        return;
    }
    try {
        const response = await fetch(`${BASE_URL}/users/${USER_ID}/craftable-items`); // Pass characterId if needed for craftable items
        const craftableItems = await response.json();
        
        craftableListContainer.innerHTML = ''; // Clear previous list
        if (craftableItems.length === 0) {
            craftableListContainer.innerHTML = '<p class="text-gray-600">제작 가능한 아이템이 없습니다.</p>';
            return;
        }

        craftableItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3 border rounded bg-white shadow';
            itemDiv.innerHTML = `
                <h3 class="font-semibold">${item.output_item_name} (제작 가능: ${item.craftable_quantity}개)</h3>
                <p class="text-sm text-gray-600">필요 시설: ${item.required_facility || '없음'}</p>
                <p class="text-sm text-gray-600">성공률: ${item.success_rate || 'N/A'}</p>
                <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
                    ${item.materials.map(mat => `
                        <li>${mat.name}: ${mat.current_quantity_in_inventory} / ${mat.quantity}
                            ${mat.current_quantity_in_inventory < mat.quantity ? `<span class="text-red-500">(부족: ${mat.quantity - mat.current_quantity_in_inventory})</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            `;
            craftableListContainer.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('제작 가능한 아이템 로드 중 오류 발생:', error);
        craftableListContainer.innerHTML = '<p class="text-red-500">제작 가능한 아이템을 불러오는 데 실패했습니다.</p>';
    }
});

// Initial data load
loadServers();

// Function to format time remaining
function formatTimeRemaining(minutes) {
    if (minutes <= 0) {
        return '가득 참';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    let parts = [];
    if (hours > 0) {
        parts.push(`${hours}시간`);
    }
    if (remainingMinutes > 0) {
        parts.push(`${remainingMinutes}분`);
    }
    return parts.join(' ') || '0분';
}

// Function to load user resources
async function loadUserResources() {
    if (!USER_ID) {
        console.warn('USER_ID가 설정되지 않았습니다.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/resources/${USER_ID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resources = await response.json();

        // Update Silver Coins display
        silverCoinsCurrent.textContent = resources.silver_coins;
        const silverCoinMaxCapacity = resources.silverCoinMaxCapacity;
        document.querySelector('#silverCoinsCurrent').nextSibling.textContent = ` / ${silverCoinMaxCapacity}`;

        const silverCoinsLastRechargeAt = new Date(resources.silver_coins_last_recharge_at);
        const silverCoinRechargeRatePerMin = 1 / 30; // 30분마다 1개

        if (resources.silver_coins >= silverCoinMaxCapacity) {
            silverCoinsTimeToFull.textContent = '가득 참';
        } else {
            const minutesElapsed = (new Date().getTime() - silverCoinsLastRechargeAt.getTime()) / (1000 * 60);
            const currentRecharged = Math.floor(minutesElapsed * silverCoinRechargeRatePerMin);
            const actualCurrentSilverCoins = resources.silver_coins + currentRecharged;
            const needed = silverCoinMaxCapacity - actualCurrentSilverCoins;
            const minutesToFull = needed / silverCoinRechargeRatePerMin;
            silverCoinsTimeToFull.textContent = formatTimeRemaining(minutesToFull);
        }

        // Update Demon Tribute display
        demonTributeCurrent.textContent = resources.demon_tribute;
        const demonTributeMaxCapacity = resources.demonTributeMaxCapacity;
        document.querySelector('#demonTributeCurrent').nextSibling.textContent = ` / ${demonTributeMaxCapacity}`;


        const demonTributeLastRechargeAt = new Date(resources.demon_tribute_last_recharge_at);
        const demonTributeRechargeRatePerMin = 1 / (12 * 60); // 12시간마다 1개

        if (resources.demon_tribute >= demonTributeMaxCapacity) {
            demonTributeTimeToFull.textContent = '가득 참';
        } else {
            const minutesElapsed = (new Date().getTime() - demonTributeLastRechargeAt.getTime()) / (1000 * 60);
            const currentRecharged = Math.floor(minutesElapsed * demonTributeRechargeRatePerMin);
            const actualCurrentDemonTribute = resources.demon_tribute + currentRecharged;
            const needed = demonTributeMaxCapacity - actualCurrentDemonTribute;
            const minutesToFull = needed / demonTributeRechargeRatePerMin;
            demonTributeTimeToFull.textContent = formatTimeRemaining(minutesToFull);
        }

    } catch (error) {
        console.error('사용자 재화 로드 중 오류 발생:', error);
        silverCoinsTimeToFull.textContent = '오류 발생';
        demonTributeTimeToFull.textContent = '오류 발생';
    }
}

// Set up periodic update for resources (e.g., every 10 seconds)
setInterval(loadUserResources, 10000); // Update every 10 seconds

// Event listeners for add/use buttons
addSilverCoinsBtn.addEventListener('click', async () => {
    const change = parseInt(silverCoinsChangeInput.value);
    if (isNaN(change) || change <= 0) {
        alert('올바른 은동전 수량을 입력하세요.');
        return;
    }
    try {
        await fetch(`${BASE_URL}/resources/${USER_ID}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ silver_coins_change: change })
        });
        silverCoinsChangeInput.value = '';
        loadUserResources(); // Refresh display
    } catch (error) {
        console.error('은동전 추가 중 오류 발생:', error);
        alert('은동전 추가에 실패했습니다.');
    }
});

useSilverCoinsBtn.addEventListener('click', async () => {
    const change = parseInt(silverCoinsChangeInput.value);
    if (isNaN(change) || change <= 0) {
        alert('올바른 은동전 수량을 입력하세요.');
        return;
    }
    try {
        await fetch(`${BASE_URL}/resources/${USER_ID}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ silver_coins_change: -change }) // Subtract for usage
        });
        silverCoinsChangeInput.value = '';
        loadUserResources(); // Refresh display
    } catch (error) {
        console.error('은동전 사용 중 오류 발생:', error);
        alert('은동전 사용에 실패했습니다.');
    }
});

addDemonTributeBtn.addEventListener('click', async () => {
    const change = parseInt(demonTributeChangeInput.value);
    if (isNaN(change) || change <= 0) {
        alert('올바른 마족 공물 수량을 입력하세요.');
        return;
    }
    try {
        await fetch(`${BASE_URL}/resources/${USER_ID}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ demon_tribute_change: change })
        });
        demonTributeChangeInput.value = '';
        loadUserResources(); // Refresh display
    } catch (error) {
        console.error('마족 공물 추가 중 오류 발생:', error);
        alert('마족 공물 추가에 실패했습니다.');
    }
});

useDemonTributeBtn.addEventListener('click', async () => {
    const change = parseInt(demonTributeChangeInput.value);
    if (isNaN(change) || change <= 0) {
        alert('올바른 마족 공물 수량을 입력하세요.');
        return;
    }
    try {
        await fetch(`${BASE_URL}/resources/${USER_ID}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ demon_tribute_change: -change }) // Subtract for usage
        });
        demonTributeChangeInput.value = '';
        loadUserResources(); // Refresh display
    } catch (error) {
        console.error('마족 공물 사용 중 오류 발생:', error);
        alert('마족 공물 사용에 실패했습니다.');
    }
});

// Function to load and display life skills for the selected character
async function loadLifeSkills() {
    if (!selectedCharacterId) {
        currentLifeSkillsSelection.textContent = `선택된 서버: ${selectedServer || '없음'}, 캐릭터: 없음`;
        lifeSkillsGrid.innerHTML = '<p class="text-gray-500">캐릭터를 선택해주세요.</p>';
        return;
    }

    currentLifeSkillsSelection.textContent = `선택된 서버: ${selectedServer || '없음'}, 캐릭터: ${selectedCharacter || '없음'}`;

    try {
        const response = await fetch(`${BASE_URL}/life-skills/${selectedCharacterId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lifeSkills = await response.json();

        lifeSkillsGrid.innerHTML = ''; // Clear existing content

        if (lifeSkills.length === 0) {
            lifeSkillsGrid.innerHTML = '<p class="text-gray-600">등록된 생활스킬이 없습니다.</p>';
            return;
        }

        lifeSkills.forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = 'p-3 border rounded bg-white shadow flex flex-col items-center';
            skillCard.innerHTML = `
                ${skill.icon_url ? `<img src="${skill.icon_url}" alt="${skill.life_skill_name} 아이콘" class="w-12 h-12 mb-2">` : '<div class="w-12 h-12 mb-2 flex items-center justify-center bg-gray-200 rounded-full">?</div>'}
                <h3 class="font-semibold text-lg mb-1">${skill.life_skill_name}</h3>
                <p class="text-gray-700 mb-2">Lv. <span id="lifeSkillLevel-${skill.life_skill_id}">${skill.level}</span></p>
                <div class="flex items-center mt-2">
                    <input type="number" id="lifeSkillInput-${skill.life_skill_id}" value="${skill.level}" min="0" class="shadow appearance-none border rounded w-20 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center">
                    <button class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline" 
                            data-skill-id="${skill.life_skill_id}" 
                            onclick="updateLifeSkillLevel(this.dataset.skillId, document.getElementById('lifeSkillInput-${skill.life_skill_id}').value)">
                        수정
                    </button>
                </div>
            `;
            lifeSkillsGrid.appendChild(skillCard);
        });
    } catch (error) {
        console.error('생활스킬 로드 중 오류 발생:', error);
        lifeSkillsGrid.innerHTML = '<p class="text-red-500">생활스킬을 불러오는 데 실패했습니다.</p>';
    }
}

// Function to update life skill level
async function updateLifeSkillLevel(lifeSkillId, level) {
    const newLevel = parseInt(level);
    if (isNaN(newLevel) || newLevel < 0) {
        alert('레벨은 0 이상이어야 합니다.');
        loadLifeSkills(); // Refresh display
        return;
    }
    if (!selectedCharacterId) {
        alert('캐릭터를 먼저 선택해주세요.');
        return;
    }

    try {
        await fetch(`${BASE_URL}/life-skills/${selectedCharacterId}/${lifeSkillId}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ level: newLevel })
        });
        loadLifeSkills(); // Refresh display
    } catch (error) {
        console.error('생활스킬 레벨 업데이트 중 오류 발생:', error);
        alert('생활스킬 레벨 업데이트에 실패했습니다.');
    }
}

// Initial data load
loadServers(); 