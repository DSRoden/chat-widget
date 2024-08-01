export function initializeStories(storyCategories, stories) {
    const storyContainer = document.getElementById('huddleWidgetStoryContainer');
    const storyChaptersContainer = document.getElementById('huddleWidgetStoryChaptersContainer');
    const storyCategoriesContainer = document.getElementById('huddleWidgetStoryCategoriesContainer');
    const storyProgressContainer = document.getElementById('huddleWidgetStoryProgressContainer');
    const huddleWidgetMenuButton = document.getElementById('huddleWidgetMenuButton');

    huddleWidgetMenuButton.addEventListener('click', (e) => window.huddleToggleMenu(e));
    let currentStoryIndex = 0;
    let currentChapterIndex = 0;
    let currentStory = stories[currentStoryIndex];
    let intervalId = null;
    let isPaused = false;
    let secondsPassed = 0;

    function preloadChapterMedia(chapter) {
        const { type, url } = chapter.payload;
        return new Promise((resolve) => {
            if (type === 'image') {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve();
            } else if (type === 'video') {
                const video = document.createElement('video');
                video.src = url;
                video.onloadeddata = () => resolve();
            }
        });
    }

    function displayChapter(storyIndex, chapterIndex) {
        console.log('Displaying chapter:', storyIndex, chapterIndex);
        const chapter = stories[storyIndex].chapters[chapterIndex];
        const { type, url, length } = chapter.payload;

        preloadChapterMedia(chapter).then(() => {
            let mediaElement = '';
            if (type === 'image') {
                mediaElement = `<img src="${url}" alt="Story Image" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else if (type === 'video') {
                mediaElement = `
                    <video id="storyVideo" style="width: 100%; height: 100%; object-fit: cover;" autoplay muted>
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }

            const newChapterElement = document.createElement('div');
            newChapterElement.className = 'chapter';
            newChapterElement.innerHTML = `
                ${mediaElement}
                <div class="story-overlay">
                    <h2>${chapter.caption}</h2>
                    <p>${chapter.description}</p>
                </div>
            `;

            storyChaptersContainer.appendChild(newChapterElement);

            setTimeout(() => {
                newChapterElement.classList.add('show');
            }, 10);

            setTimeout(() => {
                const currentChapterElement = storyChaptersContainer.querySelector('.chapter:not(.show)');
                if (currentChapterElement) {
                    currentChapterElement.classList.remove('show');
                    setTimeout(() => {
                        storyChaptersContainer.removeChild(currentChapterElement);
                    }, 500);
                }
            }, 10);

            updateProgressBar(chapterIndex, length);

            if (intervalId) {
                clearInterval(intervalId);
            }

            secondsPassed = 0;
            intervalId = setInterval(() => {
                if (!isPaused) {
                    secondsPassed++;
                    console.log('Seconds passed:', secondsPassed);
                    if (secondsPassed >= length) {
                        clearInterval(intervalId);
                        showNextChapter();
                    }
                }
            }, 1000);

            if (type === 'video') {
                const videoElement = document.getElementById('storyVideo');
                videoElement.addEventListener('ended', () => {
                    if (!isPaused) {
                        clearInterval(intervalId);
                        showNextChapter();
                    }
                });
            }
        });
    }

    function updateProgressBar(activeChapterIndex, duration) {
        console.log('Updating progress bar for chapter index:', activeChapterIndex);
        storyProgressContainer.innerHTML = '';
        currentStory.chapters.forEach((chapter, index) => {
            const progressElement = document.createElement('div');
            progressElement.className = 'progress-bar';
            const fillElement = document.createElement('div');
            fillElement.className = 'fill';

            if (index <= activeChapterIndex) {
                if (index === activeChapterIndex) {
                    fillElement.style.transition = `width ${duration}s linear`;
                    setTimeout(() => {
                        fillElement.style.width = '100%';
                    }, 50);
                } else {
                    fillElement.style.width = '100%';
                }
                console.log('Setting progress bar for chapter', index, 'with duration', duration);
            }

            progressElement.appendChild(fillElement);
            storyProgressContainer.appendChild(progressElement);
        });
    }

    function showNextChapter() {
        console.log('Showing next chapter');
        if (currentChapterIndex < currentStory.chapters.length - 1) {
            currentChapterIndex++;
        } else {
            currentChapterIndex = 0;
        }
        displayChapter(currentStoryIndex, currentChapterIndex);
    }

    function showPreviousChapter() {
        console.log('Showing previous chapter');
        if (currentChapterIndex > 0) {
            currentChapterIndex--;
        } else {
            currentChapterIndex = currentStory.chapters.length - 1;
        }
        displayChapter(currentStoryIndex, currentChapterIndex);
    }

    storyContainer.addEventListener('click', (event) => {
        const rect = storyContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        if (x < rect.width / 2) {
            showPreviousChapter();
        } else {
            showNextChapter();
        }
    });

    displayChapter(currentStoryIndex, currentChapterIndex);

    storyCategories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'story-category';
        categoryElement.innerHTML = `
            <img src="${category.image}" alt="Category Image">
            <div class="category-caption">${category.caption}</div>
        `;
        categoryElement.addEventListener('click', (e) => handleStoryCategoryClick(e, category));
        storyCategoriesContainer.appendChild(categoryElement);
    });

    function handleStoryCategoryClick(e, category) {
        e.stopPropagation();
        console.log('Category clicked:', category);
    }

    // when the toggleMenu is true hide the chapters container and the categories container and the progress container
    window.huddleToggleMenu = (e) => {
        e.stopPropagation();
        console.log('Menu clicked');
        const elements = [storyChaptersContainer, storyCategoriesContainer, storyProgressContainer];
        elements.forEach(element => {
            element.classList.toggle('huddle-widget-story-hidden');
        });

        isPaused = !isPaused;

        if (!isPaused) {
            // Reset the chapter index and display the first chapter from the beginning
            currentChapterIndex = 0;
            displayChapter(currentStoryIndex, currentChapterIndex);
        } else {
            const currentChapter = stories[currentStoryIndex].chapters[currentChapterIndex];
            const { type } = currentChapter.payload;

            if (type === 'video') {
                const videoElement = document.getElementById('storyVideo');
                if (videoElement) {
                    videoElement.pause();
                }
            }

            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    }
}