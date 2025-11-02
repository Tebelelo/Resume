document.addEventListener('DOMContentLoaded', () => {
    // Get references to key elements in the DOM
    const form = document.getElementById('resume-form');
    const resumePreview = document.getElementById('resume-preview');
    const noPreviewMessage = document.getElementById('no-preview');
    const generatePdfBtn = document.getElementById('generate-pdf');
    const downloadDocBtn = document.getElementById('download-doc');
    const addEducationBtn = document.getElementById('add-education');
    const addExperienceBtn = document.getElementById('add-experience');
    const educationContainer = document.getElementById('education-container');
    const experienceContainer = document.getElementById('experience-container');
    const templateButtons = document.querySelectorAll('.template-btn');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');
    const jobRoleInput = document.getElementById('job-role');
    const summaryTextarea = document.getElementById('summary');
    const aiBtnText = document.getElementById('ai-btn-text');
    const aiLoadingText = document.getElementById('ai-loading');
    
    // ATS Elements
    const jobDescriptionInput = document.getElementById('job-description');
    const checkAtsBtn = document.getElementById('check-ats-btn');
    const atsBtnText = document.getElementById('ats-btn-text');
    const atsLoadingText = document.getElementById('ats-loading');
    const atsResultsDiv = document.getElementById('ats-results');

    // New element for generating skills
    const generateSkillsBtn = document.getElementById('generate-skills-btn');
    const skillsTextarea = document.getElementById('skills');

    // --- Template Selection Logic ---
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            templateButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                btn.classList.add('bg-gray-400', 'hover:bg-gray-500');
            });
            // Add active class to the clicked button
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
            button.classList.remove('bg-gray-400', 'hover:bg-gray-500');
            
            // Update the preview template class and trigger a preview update
            const template = button.dataset.template;
            resumePreview.className = `resume-preview template-${template}`;
            updatePreview();
        });
    });

    /**
     * Creates a new set of input fields for an education entry.
     */
    function createEducationEntry() {
        const entry = document.createElement('div');
        entry.className = 'education-entry flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2';
        entry.innerHTML = `
            <input type="text" placeholder="Degree, e.g. B.S. Computer Science" class="w-full sm:flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" placeholder="University" class="w-full sm:flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" placeholder="Year" class="w-full sm:w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button type="button" class="remove-entry text-red-500 hover:text-red-700 font-bold text-xl leading-none">&times;</button>
        `;
        return entry;
    }

    /**
     * Creates a new set of input fields for a work experience entry.
     */
    function createExperienceEntry() {
        const entry = document.createElement('div');
        entry.className = 'experience-entry space-y-1 mt-4';
        entry.innerHTML = `
            <input type="text" placeholder="Job Title" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" placeholder="Company" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" placeholder="Dates, e.g. 2020 - Present" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                <textarea placeholder="Job responsibilities and achievements (one per line)" rows="3" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                <button type="button" class="generate-responsibilities-btn w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition duration-300">
                    <span class="ai-btn-text">Generate with AI</span>
                    <span class="ai-loading hidden animate-pulse">Generating...</span>
                </button>
            </div>
            <button type="button" class="remove-entry text-red-500 hover:text-red-700 font-bold">&times; Remove</button>
        `;
        return entry;
    }

    // Add event listeners for adding new entries
    addEducationBtn.addEventListener('click', () => {
        const newEntry = createEducationEntry();
        educationContainer.appendChild(newEntry);
        // Attach event listeners to the new input fields for live preview
        Array.from(newEntry.querySelectorAll('input, textarea')).forEach(el => {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        });
        updatePreview(); // Update preview after adding
    });

    addExperienceBtn.addEventListener('click', () => {
        const newEntry = createExperienceEntry();
        experienceContainer.appendChild(newEntry);
        // Attach event listeners to the new input fields for live preview
        Array.from(newEntry.querySelectorAll('input, textarea')).forEach(el => {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        });
        updatePreview(); // Update preview after adding
    });

    // Handle removal of entries
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-entry')) {
            e.target.closest('.education-entry, .experience-entry').remove();
            updatePreview(); // Update preview after removing
        }
    });

    /**
     * Generates an HTML string for the resume based on form data.
     * @returns {string} The HTML content of the resume.
     */
    function generateResumeHtml() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const linkedin = document.getElementById('linkedin').value;
        const summary = document.getElementById('summary').value;
        const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s);
        
        let resumeContent = '';

        if (name) {
            // Check the current template to apply specific header layouts
            const currentTemplate = document.querySelector('.resume-preview').className.split(' ').find(cls => cls.startsWith('template-')).replace('template-', '');

            if (currentTemplate === 'professional') {
                resumeContent += `
                    <div class="header-info mb-6">
                        <h1 class="text-4xl font-bold">${name}</h1>
                        <p class="text-lg mt-1">${email} | ${phone} ${linkedin ? '| <a href="' + linkedin + '" target="_blank" class="text-blue-500 hover:underline">' + new URL(linkedin).hostname.replace('www.', '') + '</a>' : ''}</p>
                    </div>
                `;
            } else {
                resumeContent += `
                    <div class="text-center mb-6">
                        <h1 class="text-4xl font-bold">${name}</h1>
                        <p class="text-lg mt-1">${email} | ${phone} ${linkedin ? '| <a href="' + linkedin + '" target="_blank" class="text-blue-500 hover:underline">' + new URL(linkedin).hostname.replace('www.', '') + '</a>' : ''}</p>
                    </div>
                `;
            }
        }

        if (summary) {
            resumeContent += `
                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 pb-1">Summary</h2>
                    <p class="mt-2 text-justify">${summary}</p>
                </div>
            `;
        }

        // Get education details
        const educationEntries = document.querySelectorAll('#education-container .education-entry');
        if (educationEntries.length > 0) {
            let educationHtml = '';
            educationEntries.forEach(entry => {
                const degree = entry.children[0].value;
                const university = entry.children[1].value;
                const year = entry.children[2].value;
                if (degree && university && year) {
                    educationHtml += `
                        <div>
                            <div class="flex justify-between font-semibold">
                                <h3>${degree}</h3>
                                <span>${year}</span>
                            </div>
                            <p>${university}</p>
                        </div>
                    `;
                }
            });
            if (educationHtml) {
                resumeContent += `
                    <div class="mb-6">
                        <h2 class="text-xl font-bold border-b-2 pb-1">Education</h2>
                        <div class="mt-2 space-y-2">
                            ${educationHtml}
                        </div>
                    </div>
                `;
            }
        }
        
        // Get work experience details
        const experienceEntries = document.querySelectorAll('#experience-container .experience-entry');
        if (experienceEntries.length > 0) {
            let experienceHtml = '';
            experienceEntries.forEach(entry => {
                const title = entry.querySelector('input:nth-child(1)').value;
                const company = entry.querySelector('input:nth-child(2)').value;
                const dates = entry.querySelector('input:nth-child(3)').value;
                const responsibilities = entry.querySelector('textarea').value.split('\n').map(s => s.trim()).filter(s => s);
                if (title && company && dates) {
                    experienceHtml += `
                        <div>
                            <div class="flex justify-between font-semibold">
                                <h3>${title}</h3>
                                <span>${dates}</span>
                            </div>
                            <p class="font-medium">${company}</p>
                            ${responsibilities.length > 0 ? `<ul class="list-disc list-inside mt-1 space-y-1">${responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
                        </div>
                    `;
                }
            });
            if (experienceHtml) {
                resumeContent += `
                    <div class="mb-6">
                        <h2 class="text-xl font-bold border-b-2 pb-1">Experience</h2>
                        <div class="mt-2 space-y-4">
                            ${experienceHtml}
                        </div>
                    </div>
                `;
            }
        }

        if (skills.length > 0) {
            resumeContent += `
                <div>
                    <h2 class="text-xl font-bold border-b-2 pb-1">Skills</h2>
                    <p class="mt-2">${skills.join(' • ')}</p>
                </div>
            `;
        }

        return resumeContent;
    }
    
    /**
     * Updates the resume preview with the latest data from the form.
     */
    function updatePreview() {
        const generatedHtml = generateResumeHtml();

        if (generatedHtml.trim() !== '') {
            resumePreview.innerHTML = generatedHtml;
            resumePreview.classList.remove('hidden');
            noPreviewMessage.classList.add('hidden');
        } else {
            resumePreview.classList.add('hidden');
            noPreviewMessage.classList.remove('hidden');
        }
    }

    // Attach event listeners to all form fields for live preview updates
    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview); // Use change for textareas to be sure

    // Event listener for generating the PDF
    generatePdfBtn.addEventListener('click', () => {
        const generatedHtml = generateResumeHtml();
        if (generatedHtml.trim() === '') {
             const infoBox = document.createElement('div');
            infoBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-green-600 mb-4">No Resume Content</p>
                        <p>Please enter your details to generate a resume before downloading.</p>
                        <button class="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoBox);
            return;
        }

        // To generate a PDF, we need to put the HTML in a container first
        resumePreview.innerHTML = generatedHtml;
        resumePreview.classList.remove('hidden');
        noPreviewMessage.classList.add('hidden');
        
        html2canvas(resumePreview, {
            scale: 2 // Use a higher scale for better quality PDF
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 size
            const pageHeight = 297; // A4 size
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('resume.pdf');
        }).catch(error => {
            console.error("Error generating PDF:", error);
            const errorBox = document.createElement('div');
            errorBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-red-600 mb-4">Error!</p>
                        <p>Could not generate the PDF. Please check the console for more details.</p>
                        <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorBox);
        });
    });

    // Event listener for downloading as a DOC file
    downloadDocBtn.addEventListener('click', () => {
        const generatedHtml = generateResumeHtml();
        if (generatedHtml.trim() === '') {
            const infoBox = document.createElement('div');
            infoBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-blue-600 mb-4">No Resume Content</p>
                        <p>Please enter your details to generate a resume before downloading.</p>
                        <button class="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoBox);
            return;
        }

        // To create a .doc file, we create a blob with a specific MIME type
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Inter', sans-serif; line-height: 1.5; }
                    .resume-content { max-width: 800px; margin: auto; padding: 20px; }
                    h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem; }
                    h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.25rem; }
                    h3 { font-size: 1.25rem; font-weight: 600; }
                    ul { list-style-type: disc; padding-left: 20px; }
                    .header-info { text-align: center; }
                </style>
            </head>
            <body>
                <div class="resume-content">
                    ${generatedHtml}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: 'application/msword;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const model = 'gemini-2.5-flash-preview-05-20'; 

    // Helper function for exponential backoff
    async function callApiWithBackoff(payload, retries = 3, delay = 1000) {
        try {
            const response = await fetch('http://localhost:3000/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && retries > 0) {
                // Too Many Requests, retry with backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                return callApiWithBackoff(payload, retries - 1, delay * 2);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API call failed after retries:", error);
            throw error;
        }
    }
    
    /**
     * Generates a professional summary using the Gemini API.
     */
    generateSummaryBtn.addEventListener('click', async () => {
        const jobRole = jobRoleInput.value;
        const name = document.getElementById('name').value;
        if (!jobRole) {
            const infoBox = document.createElement('div');
            infoBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-blue-600 mb-4">Please Enter a Job Role</p>
                        <p>To generate a summary, please enter a job role (e.g., 'Software Engineer') in the input box.</p>
                        <button class="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoBox);
            return;
        }

        aiBtnText.classList.add('hidden');
        aiLoadingText.classList.remove('hidden');
        generateSummaryBtn.disabled = true;

        const prompt = `Generate a 3-4 sentence professional summary for a resume. The person's name is ${name || 'an applicant'}, and they are applying for the role of ${jobRole}. Focus on key skills and accomplishments relevant to the role. Ensure the summary is ATS-friendly.`;
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        const apiPayload = {
            model: model,
            payload: payload
        };

        try {
            const result = await callApiWithBackoff(apiPayload);
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                summaryTextarea.value = text;
                updatePreview(); // Update preview after AI generation
            } else {
                console.error("Unexpected API response structure:", result);
                const errorBox = document.createElement('div');
                errorBox.innerHTML = `
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                            <p class="text-xl font-semibold text-red-600 mb-4">API Error</p>
                            <p>Failed to generate summary. Please try again later.</p>
                            <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorBox);
            }
        } catch (error) {
            const errorBox = document.createElement('div');
            errorBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-red-600 mb-4">Network Error</p>
                        <p>Could not connect to the generation service. Please check your network connection and try again.</p>
                        <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorBox);
        } finally {
            aiBtnText.classList.remove('hidden');
            aiLoadingText.classList.add('hidden');
            generateSummaryBtn.disabled = false;
        }
    });
    
    // Event delegation for the new "Generate Responsibilities" buttons
    experienceContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.generate-responsibilities-btn')) {
            const button = e.target.closest('.generate-responsibilities-btn');
            const entry = button.closest('.experience-entry');
            const jobTitle = entry.querySelector('input:nth-child(1)').value;
            const company = entry.querySelector('input:nth-child(2)').value;
            const dates = entry.querySelector('input:nth-child(3)').value;
            const responsibilitiesTextarea = entry.querySelector('textarea');
            const aiBtnTextElement = button.querySelector('.ai-btn-text');
            const aiLoadingTextElement = button.querySelector('.ai-loading');

            if (!jobTitle) {
                const infoBox = document.createElement('div');
                infoBox.innerHTML = `
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                            <p class="text-xl font-semibold text-blue-600 mb-4">Please Enter a Job Title</p>
                            <p>To generate responsibilities, please enter a job title first (e.g., 'Project Manager').</p>
                            <button class="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(infoBox);
                return;
            }

            aiBtnTextElement.classList.add('hidden');
            aiLoadingTextElement.classList.remove('hidden');
            button.disabled = true;

            const prompt = `Generate a bulleted list of 3-5 key job responsibilities for a resume. The role is a ${jobTitle} ${company ? 'at ' + company : ''} ${dates ? 'from ' + dates : ''}. The responsibilities should be professional, action-oriented, and suitable for a resume, formatted as a simple markdown list.`;
            
            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };
            const apiPayload = {
                model: model,
                payload: payload
            };

            try {
                const result = await callApiWithBackoff(apiPayload);
                
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    let text = result.candidates[0].content.parts[0].text;
                    // Replace markdown list items with a simple newline separated list
                    text = text.replace(/^- /, '').replace(/\n- /g, '\n').trim();
                    responsibilitiesTextarea.value = text;
                    updatePreview(); // Update preview after AI generation
                } else {
                    console.error("Unexpected API response structure:", result);
                    const errorBox = document.createElement('div');
                    errorBox.innerHTML = `
                        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                                <p class="text-xl font-semibold text-red-600 mb-4">API Error</p>
                                <p>Failed to generate responsibilities. Please try again later.</p>
                                <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(errorBox);
                }
            } catch (error) {
                const errorBox = document.createElement('div');
                errorBox.innerHTML = `
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                            <p class="text-xl font-semibold text-red-600 mb-4">Network Error</p>
                            <p>Could not connect to the generation service. Please check your network connection and try again.</p>
                            <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorBox);
            } finally {
                aiBtnTextElement.classList.remove('hidden');
                aiLoadingTextElement.classList.add('hidden');
                button.disabled = false;
            }
        }
    });

    // --- New Event Listener for Generating Skills ---
    generateSkillsBtn.addEventListener('click', async () => {
        const jobRole = jobRoleInput.value;
        const button = generateSkillsBtn;
        const aiBtnTextElement = button.querySelector('.ai-btn-text');
        const aiLoadingTextElement = button.querySelector('.ai-loading');

        if (!jobRole) {
            const infoBox = document.createElement('div');
            infoBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-blue-600 mb-4">Please Enter a Job Role</p>
                        <p>To generate skills, please enter a job role (e.g., 'Software Engineer') in the input box above the summary section.</p>
                        <button class="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoBox);
            return;
        }

        aiBtnTextElement.classList.add('hidden');
        aiLoadingTextElement.classList.remove('hidden');
        button.disabled = true;

        const prompt = `Generate a comma-separated list of 10-15 key skills for a resume. The role is a ${jobRole}. Include a mix of hard and soft skills that are professional and ATS-friendly. Do not include any extra text, just the comma-separated list.`;
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        const apiPayload = {
            model: model,
            payload: payload
        };

        try {
            const result = await callApiWithBackoff(apiPayload);
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                // Append generated skills to existing skills, removing duplicates
                const existingSkills = skillsTextarea.value.split(',').map(s => s.trim()).filter(s => s);
                const newSkills = text.split(',').map(s => s.trim()).filter(s => s);
                const combinedSkills = [...new Set([...existingSkills, ...newSkills])]; // Use a Set to remove duplicates
                skillsTextarea.value = combinedSkills.join(', ');
                updatePreview(); // Update preview after AI generation
            } else {
                console.error("Unexpected API response structure:", result);
                const errorBox = document.createElement('div');
                errorBox.innerHTML = `
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                            <p class="text-xl font-semibold text-red-600 mb-4">API Error</p>
                            <p>Failed to generate skills. Please try again later.</p>
                            <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorBox);
            }
        } catch (error) {
            const errorBox = document.createElement('div');
            errorBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-red-600 mb-4">Network Error</p>
                        <p>Could not connect to the generation service. Please check your network connection and try again.</p>
                        <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorBox);
        } finally {
            aiBtnTextElement.classList.remove('hidden');
            aiLoadingTextElement.classList.add('hidden');
            button.disabled = false;
        }
    });

    /**
     * Checks ATS compatibility using the Gemini API.
     */
    checkAtsBtn.addEventListener('click', async () => {
        const jobDescription = jobDescriptionInput.value;
        const resumeText = generateResumeHtml().replace(/<[^>]*>?/gm, ''); // Strip HTML tags
        
        if (resumeText.trim() === '' || jobDescription.trim() === '') {
            const infoBox = document.createElement('div');
            infoBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-green-600 mb-4">Missing Information</p>
                        <p>Please ensure both your resume details are filled out and a job description is pasted to perform an ATS check.</p>
                        <button class="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoBox);
            return;
        }

        atsBtnText.classList.add('hidden');
        atsLoadingText.classList.remove('hidden');
        checkAtsBtn.disabled = true;
        atsResultsDiv.classList.add('hidden');

        const prompt = `Analyze the following resume against the provided job description as an ATS (Applicant Tracking System). Provide a detailed analysis, including:
1.  An ATS compatibility score out of 10.
2.  A list of key skills and qualifications from the job description that are present in the resume.
3.  A list of key skills and qualifications from the job description that are missing or not explicitly stated in the resume.
4.  Actionable suggestions for improving the resume to better match the job description.

---
Job Description:
${jobDescription}

---
Resume Content:
${resumeText}
---`;

        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        const apiPayload = {
            model: model,
            payload: payload
        };

        try {
            const result = await callApiWithBackoff(apiPayload);

            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                // Simple Markdown-to-HTML conversion
                const htmlContent = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                atsResultsDiv.innerHTML = htmlContent;
                atsResultsDiv.classList.remove('hidden');
            } else {
                console.error("Unexpected API response structure:", result);
                const errorBox = document.createElement('div');
                errorBox.innerHTML = `
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                            <p class="text-xl font-semibold text-red-600 mb-4">API Error</p>
                            <p>Failed to get ATS results. Please try again later.</p>
                            <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorBox);
            }
        } catch (error) {
            const errorBox = document.createElement('div');
            errorBox.innerHTML = `
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <p class="text-xl font-semibold text-red-600 mb-4">Network Error</p>
                        <p>Could not connect to the generation service. Please check your network connection and try again.</p>
                        <button class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorBox);
        } finally {
            atsBtnText.classList.remove('hidden');
            atsLoadingText.classList.add('hidden');
            checkAtsBtn.disabled = false;
        }
    });
});
