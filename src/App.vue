<template>
    <div class="z-20">
        <!-- Floating Icon -->
        <div
            class="fixed bottom-8 right-8 z-20 flex h-14 w-14 transform cursor-pointer items-center justify-center rounded-full bg-[rgb(17,102,238)] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            @click="toggleModal"
            aria-label="Open chat"
        >
            <Icon :icon="isModalOpen ? 'tabler:x' : 'tabler:messages'" class="text-xl text-white" />
        </div>

        <!-- Chat Modal -->
        <div
            v-if="isModalOpen"
            class="fixed bottom-24 right-8 z-20 flex h-[500px] w-96 transform flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-300"
        >
            <!-- Modal Header -->
            <div class="flex items-center justify-between bg-[rgb(17,102,238)] p-4">
                <h3 class="text-lg font-semibold text-white">Virtual Assistant</h3>
                <div class="flex items-center gap-2">
                    <!-- Windows tray style speaker toggle -->
                    <button
                        @click="toggleVoice"
                        class="flex items-center justify-center rounded-full p-1 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.2)]"
                        aria-label="Toggle voice"
                    >
                        <div class="relative">
                            <Icon
                                icon="tabler:speakerphone"
                                class="text-xl text-white"
                                :class="{ 'opacity-50': !voiceEnabled }"
                            />
                            <div
                                v-if="!voiceEnabled"
                                class="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
                            ></div>
                        </div>
                    </button>

                    <!-- Clear chat button -->
                    <button
                        @click="clearAllMessages"
                        class="group flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200"
                        :class="{
                            'cursor-default opacity-50': messages.length === 0,
                            'cursor-pointer hover:bg-[rgba(255,255,255,0.2)]': messages.length > 0,
                        }"
                        aria-label="Clear all messages"
                        :disabled="messages.length === 0"
                    >
                        <div class="relative h-4 w-4">
                            <!-- Simple trash can icon instead of reload -->
                            <Icon
                                icon="tabler:reload"
                                class="text-white transition-opacity duration-200"
                                :class="{
                                    'opacity-50': messages.length === 0,
                                    'opacity-100': messages.length > 0,
                                }"
                            />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Chat Display Area -->
            <div class="flex-1 overflow-y-auto bg-gray-50 p-4" ref="chatContainer">
                <div
                    v-for="(message, index) in messages"
                    :key="index"
                    :class="[
                        'mb-4 flex',
                        message.sender === 'user' ? 'justify-end' : 'justify-start',
                    ]"
                >
                    <div
                        :class="[
                            'flex max-w-[80%] items-start gap-2',
                            message.sender === 'user' ? 'flex-row-reverse' : '',
                        ]"
                    >
                        <!-- Fixed Icon Container -->
                        <div
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-md"
                            :class="message.sender === 'user' ? 'bg-[rgb(17,102,238)]' : ''"
                        >
                            <!-- User Icon -->
                            <Icon
                                v-if="message.sender === 'user'"
                                icon="tabler:user"
                                class="text-sm text-white"
                            />
                            <!-- Chatbot Image (no background) -->
                            <img v-else src="/chatbot.png" class="h-10 w-10" alt="Chatbot" />
                        </div>

                        <!-- Message Container -->
                        <div
                            :class="[
                                'rounded-lg p-3 shadow-sm',
                                message.sender === 'user'
                                    ? 'bg-[rgb(17,102,238)] text-white'
                                    : 'border border-gray-200 bg-white text-gray-800',
                            ]"
                        >
                            <span class="text-sm" style="white-space: pre-line">
                                {{ message.displayText || message.text }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Loading Spinner -->
                <div v-if="isLoading" class="mb-4 flex justify-start">
                    <div class="flex items-center gap-2">
                        <div
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-md"
                        >
                            <img
                                src="/chatbot.png"
                                class="h-10 w-10 object-contain"
                                alt="Chatbot"
                            />
                        </div>
                        <div
                            class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-gray-800 shadow-sm"
                        >
                            <Icon
                                icon="tabler:loader-2"
                                class="animate-spin text-sm text-[rgb(17,102,238)]"
                            />
                            <span class="text-sm">Responding...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Box -->
            <div class="relative border-t border-gray-200 bg-white p-3">
                <div class="relative">
                    <input
                        v-model="userInput"
                        @keyup.enter="sendMessage"
                        type="text"
                        placeholder="Type your question..."
                        :disabled="isLoading"
                        class="w-full rounded-full border border-gray-300 py-3 pl-4 pr-20 text-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[rgb(17,102,238)] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Type your question"
                    />

                    <!-- Action Buttons -->
                    <div
                        class="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center gap-1"
                    >
                        <!-- Microphone Button -->
                        <button
                            @click="toggleVoiceInput"
                            :disabled="isLoading"
                            :class="[
                                'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200',
                                isListening
                                    ? 'bg-[rgb(17,102,238)] text-white'
                                    : 'text-gray-500 hover:bg-[rgb(17,102,238)] hover:text-white',
                            ]"
                            aria-label="Toggle voice input"
                        >
                            <Icon
                                :icon="isListening ? 'tabler:microphone-off' : 'tabler:microphone'"
                                class="text-sm"
                            />
                        </button>

                        <!-- Send Button -->
                        <button
                            @click="sendMessage"
                            :disabled="isLoading || !userInput.trim()"
                            :class="[
                                'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200',
                                userInput.trim() && !isLoading
                                    ? 'bg-[rgb(17,102,238)] text-white'
                                    : 'cursor-not-allowed bg-[rgb(17,102,238,0.7)] text-white',
                            ]"
                            aria-label="Send message"
                        >
                            <Icon icon="tabler:send" class="text-sm" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import axios from './config/axios'
import InputData from './config/data'

// State
const isModalOpen = ref(false)
const userInput = ref('')
const messages = reactive([])
const isListening = ref(false)
const isLoading = ref(false)
const voiceEnabled = ref(false)
const chatContainer = ref(null)
const recognition = ref(null)
const synth = ref(typeof window !== 'undefined' ? window.speechSynthesis : null)
const currentUtterance = ref(null)
const typingInterval = ref(null)

// Utility Functions
const clearChat = () => {
    stopSpeaking()
    stopVoiceInput()
    messages.length = 0 // Clear all messages

    // Optional: Add a welcome message after clearing
    messages.push({
        sender: 'bot',
        text: 'How can I help you today?',
        isTyping: false,
    })
    scrollToBottom()
}

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

const stopSpeaking = () => {
    if (synth.value?.speaking) {
        synth.value.cancel()
    }
    if (typingInterval.value) {
        clearInterval(typingInterval.value)
        typingInterval.value = null
    }
}

// Core Functions
const toggleModal = () => {
    isModalOpen.value = !isModalOpen.value
    if (!isModalOpen.value) {
        stopVoiceInput()
        stopSpeaking()
    }
}

const toggleVoice = () => {
    voiceEnabled.value = !voiceEnabled.value
    if (!voiceEnabled.value) {
        stopSpeaking()
    }
}

const stopVoiceInput = () => {
    if (recognition.value) {
        try {
            recognition.value.stop()
        } catch (e) {
            console.log('Voice recognition already stopped')
        }
    }
    isListening.value = false
}

const startVoiceInput = () => {
    if (recognition.value) {
        isListening.value = true
        recognition.value.start()
    }
}

const toggleVoiceInput = () => {
    if (isListening.value) {
        stopVoiceInput()
    } else {
        // Ensure any previous voice processing is complete
        if (!isLoading.value) {
            startVoiceInput()
        }
    }
}

const clearAllMessages = () => {
    stopSpeaking()
    stopVoiceInput()

    // Clear all messages
    messages.length = 0

    // Add welcome message as a proper reactive message
    const welcomeMessage = reactive({
        sender: 'bot',
        fullText: 'How can I help you today?',
        isTyping: false,
    })
    messages.push(welcomeMessage)
    scrollToBottom()

    if (voiceEnabled.value) {
        speakWithLiveCaption(welcomeMessage.fullText, welcomeMessage)
    } else {
        typeMessage(welcomeMessage, 10)
    }
}

const splitIntoSentences = (text) => {
    // Split by sentence-ending punctuation followed by whitespace
    return text.split(/(?<=[.!?])\s+/)
}

const speakWithLiveCaption = (text, messageObj) => {
    stopSpeaking()

    const sentences = splitIntoSentences(text)
    messageObj.text = '' // Initialize empty
    let currentSentenceIndex = 0
    let processedText = ''

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    currentUtterance.value = utterance

    // Process words in real-time
    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            const newText = text.substring(0, event.charIndex + event.charLength)
            // Only update if we have new words
            if (newText.length > processedText.length) {
                processedText = newText

                // Check if we've moved to a new sentence
                if (
                    sentences[currentSentenceIndex] &&
                    newText.includes(sentences[currentSentenceIndex])
                ) {
                    currentSentenceIndex++
                    if (currentSentenceIndex > 1) {
                        // Add line break before new sentence (except first one)
                        messageObj.text += '\n'
                    }
                }

                // Update the displayed text
                messageObj.text =
                    sentences.slice(0, currentSentenceIndex).join('\n') +
                    (currentSentenceIndex < sentences.length
                        ? '\n' +
                          processedText.substring(
                              sentences.slice(0, currentSentenceIndex).join('\n').length
                          )
                        : '')

                scrollToBottom()
            }
        }
    }

    utterance.onend = () => {
        // Ensure all text is shown with proper formatting
        messageObj.text = sentences.join('\n')
        messageObj.isTyping = false
        scrollToBottom()
        currentUtterance.value = null
    }

    synth.value?.speak(utterance)
}

const typeMessage = (message, speed) => {
    const sentences = splitIntoSentences(message.fullText)
    let currentSentenceIndex = 0
    let currentCharIndex = 0

    clearInterval(typingInterval.value)

    typingInterval.value = setInterval(() => {
        if (currentSentenceIndex >= sentences.length) {
            clearInterval(typingInterval.value)
            typingInterval.value = null
            message.isTyping = false
            return
        }

        const currentSentence = sentences[currentSentenceIndex]

        if (currentCharIndex < currentSentence.length) {
            message.text = (message.text || '') + currentSentence[currentCharIndex]
            currentCharIndex++
            scrollToBottom()
        } else {
            // Move to next sentence and add line breaks
            currentSentenceIndex++
            currentCharIndex = 0
            if (currentSentenceIndex < sentences.length) {
                message.text = (message.text || '') + '\n' // Add double line break
            }
        }
    }, speed)
}

const sendMessage = async () => {
    if (userInput.value.trim() === '' || isLoading.value) return

    try {
        isLoading.value = true
        // Stop voice input but don't interfere with response
        if (isListening.value) {
            stopVoiceInput()
        }

        messages.push({
            sender: 'user',
            text: userInput.value,
            isTyping: false,
        })
        scrollToBottom()

        const response = await axios.post('/chat/completions', {
            model: 'deepseek/deepseek-chat-v3-0324',
            messages: [
                {
                    role: 'user',
                    content: `${InputData}. this is customer's question. ${userInput.value}.`,
                },
            ],
            max_tokens: 300,
        })

        const botResponse = response.data.choices[0].message.content
        const botMessage = reactive({
            sender: 'bot',
            text: '',
            fullText: botResponse,
            isTyping: true,
        })
        messages.push(botMessage)
        scrollToBottom()

        if (voiceEnabled.value) {
            // Delay speech slightly to ensure voice input is fully stopped
            setTimeout(() => {
                speakWithLiveCaption(botResponse, botMessage)
            }, 300)
        } else {
            typeMessage(botMessage, 10)
        }
    } catch (error) {
        console.error('Error sending message:', error)
        messages.push({
            sender: 'bot',
            text: "Sorry, I couldn't process your request.",
            isTyping: false,
        })
        scrollToBottom()
    } finally {
        isLoading.value = false
        userInput.value = ''
    }
}

// Lifecycle Hooks
onMounted(() => {
    if (typeof window !== 'undefined') {
        synth.value = window.speechSynthesis
        recognition.value = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        recognition.value.continuous = false
        recognition.value.interimResults = false

        recognition.value.onresult = (event) => {
            userInput.value = event.results[0][0].transcript
            sendMessage()
        }

        recognition.value.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            stopVoiceInput()
        }
    }
})

onBeforeUnmount(() => {
    stopVoiceInput()
    stopSpeaking()
    if (typingInterval.value) {
        clearInterval(typingInterval.value)
    }
    recognition.value = null
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

/* Animations */
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
