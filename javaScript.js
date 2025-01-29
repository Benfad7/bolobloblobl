// Dark mode functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    const toggle = darkModeToggle.querySelector('div');
    if (body.classList.contains('dark-mode')) {
    toggle.style.transform = 'translateX(24px)';
        darkModeToggle.classList.remove('bg-gray-200');
        darkModeToggle.classList.add('bg-blue-600');
    } else {
        toggle.style.transform = 'translateX(0)';
        darkModeToggle.classList.add('bg-gray-200');
        darkModeToggle.classList.remove('bg-blue-600');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

// Load dark mode preference
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        const toggle = darkModeToggle.querySelector('div');
        toggle.style.transform = 'translateX(24px)';
        darkModeToggle.classList.remove('bg-gray-200');
        darkModeToggle.classList.add('bg-blue-600');
    }
    // Initialize calendar
    populateCalendar();
});

// Navigation menu functionality
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');
    // Close menu
    document.getElementById('navMenu').classList.remove('active');
}

// Settings modal functionality
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function toggleNotifications() {
    // Placeholder for notification functionality
    console.log('Notifications toggled');
}

// Calendar functionality
function populateCalendar() {
    const calendar = document.querySelector('.calendar');
    const daysInMonth = 31; // You can make this dynamic
    const headerCells = 7; // Days of week header

    // Clear existing days (except header)
    const days = calendar.querySelectorAll('.calendar-day:nth-child(n + ' + (headerCells + 1) + ')');
    days.forEach(day => day.remove());

    // Add days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        // Date number
        const dateSpan = document.createElement('span');
        dateSpan.textContent = i;
        dayElement.appendChild(dateSpan);

        // Add duty indicators (example)
        if (i % 3 === 0) { // Just an example condition
            const dutySpan = document.createElement('span');
            dutySpan.className = 'text-xs text-blue-600 dark:text-blue-400';
            dutySpan.textContent = 'שמירה';
            dayElement.appendChild(dutySpan);
        }
        if (i % 4 === 0) {
            const dutySpan = document.createElement('span');
            dutySpan.className = 'text-xs text-green-600 dark:text-green-400';
            dutySpan.textContent = 'מטבח';
            dayElement.appendChild(dutySpan);
        }

        calendar.appendChild(dayElement);
    }
}

// Exchange form submission
function submitExchange(event) {
    event.preventDefault();
    // Here you would handle the exchange request submission
    alert('בקשת ההחלפה נשלחה בהצלחה');
}

// Constraints form submission
function submitConstraints(event) {
    event.preventDefault();
    // Here you would handle the constraints submission
    alert('האילוצים נשמרו בהצלחה');
}

// Close modals and menus when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('navMenu');
    const settingsModal = document.getElementById('settingsModal');

    if (!event.target.closest('#navMenu') && !event.target.closest('button')) {
        menu.classList.remove('active');
    }

    if (settingsModal && !event.target.closest('.bg-white') && !event.target.closest('button')) {
        settingsModal.classList.add('hidden');
    }
});const firebaseConfig = {
       apiKey: "AIzaSyAE2oXv6WG8t0sKefhbqkNdti7T6Z2OZi0",
       authDomain: "bolbol-815bc.firebaseapp.com",
       projectId: "bolbol-815bc",
       storageBucket: "bolbol-815bc.firebasestorage.app",
       messagingSenderId: "925006008330",
       appId: "1:925006008330:web:e1a5924c945201045e0ff3",
       measurementId: "G-JYGPN1BWKV"
   };

   firebase.initializeApp(firebaseConfig);
   const auth = firebase.auth();
   const db = firebase.firestore();

   // Form visibility functions
   function showRegisterForm() {
       document.getElementById('loginForm').classList.add('hidden');
       document.getElementById('registerForm').classList.remove('hidden');
   }

   function showLoginForm() {
       document.getElementById('registerForm').classList.add('hidden');
       document.getElementById('loginForm').classList.remove('hidden');
   }

   // Login handler
async function handleLogin(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Check if user exists in Firestore
        const userSnapshot = await db.collection('users')
            .where('phoneNumber', '==', phoneNumber)
            .get();

        if (userSnapshot.empty) {
            alert('מספר טלפון או סיסמה שגויים');
            return;
        }

        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(
            `${phoneNumber}@dutyassign.com`,
            password
        );

        // Get the actual document data
        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;

        // Explicitly get the isOwner value from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        const currentIsOwner = userDoc.data().isOwner;

        // Store user data with explicit isOwner value
        const userDataToStore = {
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            personalNumber: userData.personalNumber,
            releaseDate: userData.releaseDate,
            isOwner: currentIsOwner // Explicitly store the current isOwner value
        };

        localStorage.setItem('userData', JSON.stringify(userDataToStore));

        // Hide login wrapper and show app wrapper
        document.getElementById('loginWrapper').style.display = 'none';
        document.getElementById('appWrapper').style.display = 'block';

        // Update displayed name
        const userGreeting = document.querySelector('#duties h2');
        if (userGreeting) {
            userGreeting.textContent = `שלום, ${userData.fullName}`;
        }

        // Immediately initialize settings with new isOwner value
        await initializeSettings();

    } catch (error) {
        console.error(error);
        alert('מספר טלפון או סיסמה שגויים');
    }
}
   // Registration handler
   async function handleRegister(event) {
       event.preventDefault();

       const fullName = document.getElementById('fullName').value;
       const phoneNumber = document.getElementById('phoneNumber').value;
       const personalNumber = document.getElementById('personalNumber').value;
       const releaseDate = document.getElementById('releaseDate').value;
       const password = document.getElementById('password').value;
       const isOwner = false;
       try {
           // Check if user exists
           const existingUser = await db.collection('users')
               .where('phoneNumber', '==', phoneNumber)
               .get();

           if (!existingUser.empty) {
               alert('מספר טלפון כבר קיים במערכת');
               return;
           }

           // Create auth user
           const userCredential = await auth.createUserWithEmailAndPassword(
               `${phoneNumber}@dutyassign.com`,
               password
           );

           // Store additional user data in Firestore
           await db.collection('users').doc(userCredential.user.uid).set({
               fullName,
               phoneNumber,
               personalNumber,
               releaseDate,
               createdAt: firebase.firestore.FieldValue.serverTimestamp(),
               isOwner
           });

           alert('ההרשמה הושלמה בהצלחה!');

           // Store user data in localStorage
           localStorage.setItem('userData', JSON.stringify({
               fullName,
               phoneNumber,
               personalNumber,
               releaseDate,
               isOwner
           }));

           // Hide login wrapper and show app wrapper
           document.getElementById('loginWrapper').style.display = 'none';
           document.getElementById('appWrapper').style.display = 'block';

           // Update displayed name
           const userGreeting = document.querySelector('#duties h2');
           if (userGreeting) {
               userGreeting.textContent = `שלום, ${fullName}`;
           }

       } catch (error) {
           console.error(error);
           alert('שגיאה בהרשמה: ' + error.message);
       }
   }

   // Check authentication state on page load
   auth.onAuthStateChanged((user) => {
       if (user) {
           // Get user data from localStorage
           const userData = JSON.parse(localStorage.getItem('userData'));
           if (userData) {
               // Hide login wrapper and show app wrapper
               document.getElementById('loginWrapper').style.display = 'none';
               document.getElementById('appWrapper').style.display = 'block';

               // Update displayed name
               const userGreeting = document.querySelector('#duties h2');
               if (userGreeting) {
                   userGreeting.textContent = `שלום, ${userData.fullName}`;
               }
           }
       }
   });
// Modified isDutyOwner function with real-time check
async function isDutyOwner() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.phoneNumber) return false;

        // Get fresh data from Firestore
        const userSnapshot = await db.collection('users')
            .where('phoneNumber', '==', userData.phoneNumber)
            .get();

        if (userSnapshot.empty) return false;

        const freshUserData = userSnapshot.docs[0].data();

        // Update localStorage with fresh data
        userData.isOwner = freshUserData.isOwner;
        localStorage.setItem('userData', JSON.stringify(userData));

        return freshUserData.isOwner;
    } catch (error) {
        console.error('Error checking isOwner status:', error);
        return false;
    }
}

// Modified initializeSettings function
async function initializeSettings() {
    try {
        const isOwner = await isDutyOwner();
        const settingsContent = document.querySelector('#settingsModal .space-y-4');

        if (!settingsContent) return;

        // Remove existing duty section if it exists
        const existingDutySection = settingsContent.querySelector('.duty-section');
        if (existingDutySection) {
            existingDutySection.remove();
        }

        if (isOwner) {
            const dutySection = document.createElement('div');
            dutySection.className = 'duty-section';
            dutySection.innerHTML = `
                <h3 class="text-lg font-semibold mb-3">ניהול תורנויות</h3>
                <button onclick="showDutyAssignmentModal()"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    הוספת תורנות
                </button>
            `;
            settingsContent.appendChild(dutySection);
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}


   // Function to load all users for the dropdown
   async function loadUsers() {
       try {
           const usersSnapshot = await db.collection('users').get();
           const userSelect = document.getElementById('dutyUser');
           userSelect.innerHTML = '<option value="">בחר חייל</option>';

           usersSnapshot.forEach(doc => {
               const userData = doc.data();
               const option = document.createElement('option');
               option.value = userData.personalNumber;
               option.textContent = userData.fullName;
               option.isOwner = userData.isOwner;
               userSelect.appendChild(option);
           });
       } catch (error) {
           console.error('Error loading users:', error);
           alert('שגיאה בטעינת רשימת החיילים');
       }
   }

   // Create duty assignment modal
   function createDutyAssignmentModal() {
       const modal = document.createElement('div');
       modal.id = 'dutyAssignmentModal';
       modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-30';
       modal.innerHTML = `
           <div class="bg-white dark:bg-gray-800 rounded-lg p-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md">
               <h2 class="text-xl font-bold mb-4">הוספת תורנות חדשה</h2>
               <form id="dutyAssignmentForm" class="space-y-4">
                   <div>
                       <label class="block mb-2">סוג תורנות</label>
                       <select id="dutyKind" class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                           <option value="שמירה">שמירה</option>
                           <option value="מטבח">מטבח</option>
                           <option value="רסר">רסר</option>
                       </select>
                   </div>
                   <div>
                       <label class="block mb-2">תאריך</label>
                       <input type="date" id="dutyDate"
                              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                   </div>
                   <div>
                       <label class="block mb-2">חייל</label>
                       <select id="dutyUser"
                               class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                           <option value="">בחר חייל</option>
                       </select>
                   </div>
                   <div class="flex justify-end space-x-2">
                       <button type="button" onclick="closeDutyAssignmentModal()"
                               class="px-4 py-2 border rounded">ביטול</button>
                       <button type="submit"
                               class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">הוסף</button>
                   </div>
               </form>
           </div>
       `;
       document.body.appendChild(modal);
   }

   // Show duty assignment modal
   function showDutyAssignmentModal() {
       const modal = document.getElementById('dutyAssignmentModal');
       if (!modal) {
           createDutyAssignmentModal();
       }
       loadUsers(); // Load users when opening the modal
       document.getElementById('dutyAssignmentModal').classList.remove('hidden');
   }

   // Close duty assignment modal
   function closeDutyAssignmentModal() {
       document.getElementById('dutyAssignmentModal').classList.add('hidden');
   }

   // Handle duty assignment
   async function handleDutyAssignment(event) {
       event.preventDefault();

       const kind = document.getElementById('dutyKind').value;
       const date = document.getElementById('dutyDate').value;
       const userNumber = document.getElementById('dutyUser').value;

       if (!userNumber) {
           alert('נא לבחור חייל');
           return;
       }

       try {
           // Add duty to Firestore
           await db.collection('duties').add({
               kind,
               date: new Date(date),
               userNumber,
               createdAt: firebase.firestore.FieldValue.serverTimestamp(),
               createdBy: auth.currentUser.uid
           });

           alert('התורנות נוספה בהצלחה');
           closeDutyAssignmentModal();
           loadUserDuties(); // Refresh duties display
       } catch (error) {
           console.error(error);
           alert('שגיאה בהוספת התורנות');
       }
   }

   // Load user duties
async function loadUserDuties() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;
    try {
        // Update user greeting
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = userData.fullName;
        }

        // Get start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Fetch duties for current month without ordering
        const dutiesSnapshot = await db.collection('duties')
            .where('userNumber', '==', userData.personalNumber)
            .where('date', '>=', startOfMonth)
            .where('date', '<=', endOfMonth)
            .get();

        console.log(dutiesSnapshot);

        // Get containers
        const guardDuties = document.getElementById('guardDuties');
        const kitchenDuties = document.getElementById('kitchenDuties');
        const rasarDuties = document.getElementById('rasarDuties');

        // Clear existing duties
        guardDuties.innerHTML = '';
        kitchenDuties.innerHTML = '';
        rasarDuties.innerHTML = '';

        // Track if we found any duties of each type
        let hasGuardDuties = false;
        let hasKitchenDuties = false;
        let hasRasarDuties = false;

        // Collect all duties in an array
        const duties = [];
        dutiesSnapshot.forEach(doc => {
            const duty = doc.data();
            duties.push(duty);
        });

        // Sort duties by 'date' after fetching
        duties.sort((a, b) => a.date.toDate() - b.date.toDate());

        // Add duties to appropriate containers
        duties.forEach(duty => {
            const dutyCard = createDutyCard(duty);

            switch (duty.kind) {
                case 'שמירה':
                    guardDuties.appendChild(dutyCard);
                    hasGuardDuties = true;
                    break;
                case 'מטבח':
                    kitchenDuties.appendChild(dutyCard);
                    hasKitchenDuties = true;
                    break;
                case 'רסר':
                    rasarDuties.appendChild(dutyCard);
                    hasRasarDuties = true;
                    break;
            }
        });

        // Show empty state messages if no duties found
        if (!hasGuardDuties) {
            guardDuties.innerHTML = `
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך שמירות החודש!
                </div>
            `;
        }
        if (!hasKitchenDuties) {
            kitchenDuties.innerHTML = `
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך תורנויות מטבח החודש!
                </div>
            `;
        }
        if (!hasRasarDuties) {
            rasarDuties.innerHTML = `
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך תורנויות רסר החודש!
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading duties:', error);
        alert('שגיאה בטעינת התורנויות');
    }
}
   // Create duty card element
// Modified createDutyCard function
function createDutyCard(duty) {
    const card = document.createElement('div');
    card.className = 'duty-card';

    const date = duty.date.toDate();
    const formattedDate = new Intl.DateTimeFormat('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric'
    }).format(date);

    card.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <h4 class="font-medium">${duty.kind}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">${formattedDate}</p>
            </div>
                <span class="text-xs px-2 py-1 rounded
                    ${isUpcoming(date) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">
                    ${isUpcoming(date) ? 'בקרוב' : 'סיימת'}
                </span>
        </div>
    `;

    return card;
}
   // Helper function to check if duty is upcoming
   function isUpcoming(date) {
       const now = new Date();
       const threeDays = 3 * 24 * 60 * 60 * 1000;
       return date > now && date - now < threeDays;
   }

   // Initialize event listeners
   document.addEventListener('DOMContentLoaded', () => {
       createDutyAssignmentModal();
       initializeSettings();
       loadSwitchRequests();

       updateDutiesSection();
    if (document.getElementById('constraints')) {
        updateConstraintsSection();
    }
       // Add event listener for duty assignment form
       document.getElementById('dutyAssignmentForm').addEventListener('submit', handleDutyAssignment);

       // Load duties when user is authenticated
       auth.onAuthStateChanged((user) => {
           if (user) {
               loadUserDuties();
           }
       });
   });

function updateDutiesSection() {
    const dutiesSection = document.querySelector('#duties');
    dutiesSection.innerHTML = `
        <div class="mt-6">
            <h2 class="text-2xl font-bold">שלום, <span id="userGreeting"></span></h2>
            <p class="text-gray-600 dark:text-gray-400">ברוך הבא!</p>
        </div>

        <div class="mt-6">
            <h3 class="text-lg font-semibold mb-3">שמירות</h3>
            <div id="guardDuties" class="space-y-3">
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך שמירות החודש!
                </div>
            </div>
        </div>

        <div class="mt-6">
            <h3 class="text-lg font-semibold mb-3">מטבחים</h3>
            <div id="kitchenDuties" class="space-y-3">
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך תורנויות מטבח החודש!
                </div>
            </div>
        </div>

        <div class="mt-6">
            <h3 class="text-lg font-semibold mb-3">רסר</h3>
            <div id="rasarDuties" class="space-y-3">
                <div class="duty-empty text-center p-4 text-gray-500">
                    איזה כיף, אין לך תורנויות רסר החודש!
                </div>
            </div>
        </div>
    `;
}


function updateConstraintsSection() {
    const constraintsSection = document.getElementById('constraints');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    constraintsSection.innerHTML = `
        <div class="mt-6">
            <h2 class="text-2xl font-bold mb-4">האילוצים שלי</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <!-- Duty Preferences Section -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-lg font-semibold">מה אני מעדיף</h3>
                        <span class="text-sm text-gray-500">(עד 2 אפשרויות)</span>
                    </div>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="checkbox" name="dutyPreference" value="שמירה" class="ml-2">
                            שמירה
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="dutyPreference" value="מטבח" class="ml-2">
                            מטבח
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="dutyPreference" value="רסר" class="ml-2">
                            רסר
                        </label>
                    </div>
                </div>

                <!-- Shooting Range Section -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">מטווחים בתוקף?</h3>
                    <div class="space-x-4 flex">
                        <label class="flex items-center">
                            <input type="radio" name="shootingRange" value="yes" class="ml-2">
                            כן
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="shootingRange" value="no" class="ml-2">
                            לא
                        </label>
                    </div>
                </div>

                <!-- Distance Section -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">מרוחק?</h3>
                    <div class="space-x-4 flex">
                        <label class="flex items-center">
                            <input type="radio" name="isDistant" value="yes" class="ml-2">
                            כן
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="isDistant" value="no" class="ml-2">
                            לא
                        </label>
                    </div>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                <h3 class="text-xl font-bold mb-6 text-center">
                    אילוצים לחודש ${monthNames[nextMonth.getMonth()]}
                </h3>
                <div id="constraintsCalendar" class="grid grid-cols-7 gap-1 mb-6">
                    <!-- Calendar will be populated by JavaScript -->
                </div>
                <div id="remainingConstraints" class="text-center mb-4">
                    נשארו עוד 5 אילוצים לבחור
                </div>
                <button id="submitConstraints"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    שלח אילוצים
                </button>
            </div>
        </div>
    `;

    populateCalendar(nextMonth);
    initializeConstraintsHandlers();
    initializePreferencesHandlers();
}
function populateCalendar(date) {
    const calendar = document.getElementById('constraintsCalendar');
    calendar.innerHTML = ''; // Clear existing content

    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Add day headers
    const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center font-bold p-2';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });

    // Add empty cells for alignment
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-2';
        calendar.appendChild(emptyCell);
    }

    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'p-2 text-center rounded-lg cursor-pointer transition-colors';
        dayElement.textContent = day;
        dayElement.dataset.day = day;
        calendar.appendChild(dayElement);
    }
}


function initializePreferencesHandlers() {
    // Handle duty preference checkboxes (max 2)
    const dutyPreferences = document.querySelectorAll('input[name="dutyPreference"]');
    dutyPreferences.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const checked = document.querySelectorAll('input[name="dutyPreference"]:checked');
            if (checked.length > 2) {
                e.target.checked = false;
            }
        });
    });
}

function initializeConstraintsHandlers() {
    const calendar = document.getElementById('constraintsCalendar');
    const remainingText = document.getElementById('remainingConstraints');
    const submitButton = document.getElementById('submitConstraints');
    const MAX_CONSTRAINTS = 5;
    const selectedDays = new Set();

    calendar.addEventListener('click', (event) => {
        const dayElement = event.target.closest('[data-day]');
        if (!dayElement) return;

        const day = parseInt(dayElement.dataset.day);

        if (dayElement.classList.contains('bg-red-500')) {
            dayElement.classList.remove('bg-red-500', 'text-white');
            selectedDays.delete(day);
        } else if (selectedDays.size < MAX_CONSTRAINTS) {
            dayElement.classList.add('bg-red-500', 'text-white');
            selectedDays.add(day);
        }

        remainingText.textContent = `נשארו עוד ${MAX_CONSTRAINTS - selectedDays.size} אילוצים לבחור`;
    });

    submitButton.addEventListener('click', async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.phoneNumber) {
                alert('אנא התחבר מחדש למערכת');
                return;
            }

            // Get selected preferences
            const dutyPreferences = Array.from(document.querySelectorAll('input[name="dutyPreference"]:checked'))
                .map(input => input.value);
            const shootingRange = document.querySelector('input[name="shootingRange"]:checked')?.value || null;
            const isDistant = document.querySelector('input[name="isDistant"]:checked')?.value || null;

            // Get user document reference by phone number
            const userSnapshot = await db.collection('users')
                .where('phoneNumber', '==', userData.phoneNumber)
                .get();

            if (userSnapshot.empty) {
                alert('לא נמצא משתמש במערכת');
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            // Update the user's constraints and preferences
            await db.collection('users').doc(userDoc.id).update({
                constraints: {
                    month: nextMonth.getMonth() + 1,
                    year: nextMonth.getFullYear(),
                    days: Array.from(selectedDays),
                    preferences: {
                        dutyPreferences,
                        shootingRange,
                        isDistant
                    }
                }
            });

            alert('האילוצים והעדפות נשמרו בהצלחה');
        } catch (error) {
            console.error('Error saving constraints and preferences:', error);
            alert('שגיאה בשמירת האילוצים והעדפות');
        }
    });
}
// Function to open the switch request form
function openSwitchRequestForm() {
    loadFutureAssignments();
    document.getElementById('switchRequestForm').classList.remove('hidden');
}

// Function to close the switch request form
function closeSwitchRequestForm() {
    document.getElementById('switchRequestForm').classList.add('hidden');
}

// Function to load future assignments into the dropdown
async function loadFutureAssignments() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const now = new Date();
    const switchDutySelect = document.getElementById('switchDuty');
    switchDutySelect.innerHTML = '<option value="">בחר תורנות להחלפה</option>';

    try {
        const dutiesSnapshot = await db.collection('duties')
            .where('userNumber', '==', userData.personalNumber)
            .where('date', '>=', now)
            .get();

        dutiesSnapshot.forEach(doc => {
            const duty = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${duty.kind} - ${duty.date.toDate().toLocaleDateString('he-IL')}`;
            switchDutySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading future assignments:', error);
        alert('שגיאה בטעינת התורנויות');
    }
}

// Function to submit a switch request
async function submitSwitchRequest(event) {
    event.preventDefault();

    const dutyId = document.getElementById('switchDuty').value;
    const requestedDutyType = Array.from(document.getElementById('requestedDutyType').selectedOptions).map(option => option.value);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!dutyId) {
        alert('נא לבחור תורנות להחלפה');
        return;
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    try {
        await db.collection('switches').add({
            dutyId,
            requestedDutyType,
            startDate,
            endDate,
            requesterId: userData.personalNumber,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('בקשת ההחלפה נשלחה בהצלחה');
        closeSwitchRequestForm();
        loadSwitchRequests();
    } catch (error) {
        console.error('Error submitting switch request:', error);
        alert('שגיאה בשליחת בקשת ההחלפה');
    }
}
// Function to load switch requests
// Function to load switch requests
async function loadSwitchRequests(filter = 'all') {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const switchRequestsContainer = document.getElementById('switchRequests');
    switchRequestsContainer.innerHTML = '';

    try {
        let query = db.collection('switches');

        if (filter === 'available') {
            // Filter for switches that are available for the current user
            query = query.where('status', '==', 'pending');
        }

        const switchesSnapshot = await query.get();

        switchesSnapshot.forEach(doc => {
            const switchRequest = doc.data();
            const isCurrentUser = switchRequest.requesterId === userData.personalNumber;
            const switchElement = document.createElement('div');
            switchElement.className = `duty-card ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900' : ''}`;
            switchElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-medium">${switchRequest.requestedDutyType.join(', ')}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">מבקש: ${switchRequest.requesterId}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">טווח זמן: ${switchRequest.startDate} - ${switchRequest.endDate}</p>
                        ${isCurrentUser ? '<p class="text-sm text-blue-600 dark:text-blue-300">(בקשה שלך)</p>' : ''}
                    </div>
                    ${!isCurrentUser ? `<button onclick="confirmSwitch('${doc.id}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">החלף</button>` : ''}
                </div>
            `;
            switchRequestsContainer.appendChild(switchElement);
        });
    } catch (error) {
        console.error('Error loading switch requests:', error);
        alert('שגיאה בטעינת בקשת ההחלפה');
    }
}


async function confirmSwitch(switchId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            throw new Error('User data not found');
        }

        const switchDoc = await db.collection('switches').doc(switchId).get();
        if (!switchDoc.exists) {
            throw new Error('Switch request not found');
        }

        const switchRequest = switchDoc.data();

        // Get user's available assignments within the requested date range
        const availableAssignments = await getUserAvailableAssignments(
            userData.personalNumber,
            switchRequest.startDate,
            switchRequest.endDate
        );

        // Filter assignments that match requested duty types
        const matchingAssignments = availableAssignments.filter(assignment =>
            switchRequest.requestedDutyType.includes(assignment.kind)
        );

        if (matchingAssignments.length === 0) {
            alert('אין לך תורנויות מתאימות להחלפה בטווח התאריכים המבוקש');
            return;
        }

        // Create and show the modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center';

        // Generate assignment buttons HTML
        const assignmentButtonsHTML = matchingAssignments.map(assignment => `
            <button
                onclick="handleSwitchChoice('${switchId}', '${assignment.id}')"
                class="w-full px-4 py-2 mb-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                ${assignment.kind} - ${new Date(assignment.date.toDate()).toLocaleDateString('he-IL')}
            </button>
        `).join('');

        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
                <h2 class="text-xl font-bold mb-4">בחר משימה להחלפה</h2>
                <div class="space-y-2">
                    ${assignmentButtonsHTML}
                </div>
                <button onclick="this.closest('.fixed').remove()"
                        class="w-full mt-4 px-4 py-2 border rounded">
                    ביטול
                </button>
            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error in confirmSwitch:', error);
        alert('שגיאה בטעינת אפשרויות ההחלפה');
    }
}// Function to filter switches
function filterSwitches(filter) {
    loadSwitchRequests(filter);
}


async function handleSwitchChoice(switchId, assignmentId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            throw new Error('User data not found');
        }

        const confirmResult = confirm('האם אתה בטוח שברצונך לבצע את ההחלפה?');
        if (!confirmResult) return;

        // Get the switch request and the assignment to be switched
        const [switchDoc, assignmentDoc] = await Promise.all([
            db.collection('switches').doc(switchId).get(),
            db.collection('duties').doc(assignmentId).get()
        ]);

        if (!switchDoc.exists || !assignmentDoc.exists) {
            throw new Error('Required documents not found');
        }

        const switchRequest = switchDoc.data();
        const assignment = assignmentDoc.data();

        // Perform the switch in a transaction
        await db.runTransaction(async (transaction) => {
            // Update the duties
            transaction.update(db.collection('duties').doc(assignmentId), {
                userNumber: switchRequest.requesterId
            });

            transaction.update(db.collection('duties').doc(switchRequest.dutyId), {
                userNumber: userData.personalNumber
            });

            // Mark the switch request as completed
            transaction.update(db.collection('switches').doc(switchId), {
                status: 'completed',
                completedBy: userData.personalNumber,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        // Remove the modal
        document.querySelector('.fixed').remove();

        alert('ההחלפה בוצעה בהצלחה');
        loadSwitchRequests();

    } catch (error) {
        console.error('Error in handleSwitchChoice:', error);
        alert('שגיאה בביצוע ההחלפה');
    }
}function toggleSwitchesFilter() {
    const toggle = document.getElementById('toggle');
    const label = document.getElementById('toggleLabel');
    if (toggle.checked) {
        label.textContent = 'זמין עבורי';
        loadSwitchRequests('available');
    } else {
        label.textContent = 'כל ההחלפות';
        loadSwitchRequests('all');
    }
}
async function getUserAvailableAssignments(userNumber, startDate, endDate) {
    try {
        const assignments = await db.collection('duties')
            .where('userNumber', '==', userNumber)
            .where('date', '>=', new Date(startDate))
            .where('date', '<=', new Date(endDate))
            .get();

        return assignments.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting available assignments:', error);
        throw new Error('Failed to fetch available assignments');
    }
}