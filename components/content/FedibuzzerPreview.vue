<template>
    <div>
        <form class="fedibuzzer" @submit.prevent="doFetch()">
            <input type="text" v-model="domain" :list="useMemory ? 'instances' : undefined" :autofocus="autoFocus" placeholder="インスタンスのドメイン（例: misskey.io）" />
            <datalist v-if="useMemory" id="instances">
                <option v-for="instance in instances" :value="instance"></option>
            </datalist>
            <button :disabled="isLoading" type="submit">
                <template v-if="isLoading">
                    読み込み中…
                </template>
                <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" fill="currentColor" class="i" viewBox="-10 -5 1034 1034"><path d="M539 176q-32 0-55 22t-25 55 20.5 58 56 27 58.5-20.5 27-56-20.5-59T544 176h-5zm-87 95L220 389q20 20 25 48l231-118q-19-20-24-48zm167 27q-13 25-38 38l183 184q13-25 39-38zm-142 22L342 585l40 40 143-280q-28-5-48-25zm104 16q-22 11-46 10l-8-1 21 132 56 9zm-426 34q-32 0-55 22.5t-25 55 20.5 58 56.5 27 59-21 26.5-56-21-58.5-55.5-27h-6zm90 68q1 9 1 18-1 19-10 35l132 21 26-50zm225 36-26 51 311 49q-1-8-1-17 1-19 10-36zm372 6q-32 1-55 23t-24.5 55 21 58 56 27 58.5-20.5 27-56.5-20.5-59-56.5-27h-6zm-606 13q-13 25-39 38l210 210 51-25zm-40 38q-21 11-44 10l-9-1 40 256q21-10 45-9l8 1zm364 22 48 311q21-10 44-9l10 1-46-294zm195 23-118 60 8 56 135-68q-20-20-25-48zm26 49L662 856q28 5 48 25l119-231q-28-5-48-25zm-475 29-68 134q28 5 48 25l60-119zm262 17L287 814q19 20 24 48l265-135zm-55 100-51 25 106 107q13-25 39-38zm-291 24q-32 0-55.5 22.5t-25 55 21 57.5 56 27 58.5-20.5 27-56-20.5-58.5-56.5-27h-5zm89 68q2 9 1 18-1 19-9 35l256 41q-1-9-1-18 1-18 10-35zm335 0q-32 0-55 22.5t-24.5 55 20.5 58 56 27 59-21 27-56-20.5-58.5-56.5-27h-6z"></path></svg>Fediverseに共有
                </template>
            </button>
        </form>
        <div v-if="credit" class="credit"><a href="https://fedibuzzer.ajr-news.com/" target="_blank" rel="noopener">FediShare - Powered by AJR-NEWS.com</a></div>
    </div>
</template>

<script setup lang="ts">
const domain = ref<string>('');
const isLoading = ref<boolean>(false);

const props = withDefaults(defineProps<{
    url?: string;
    text?: string | null;
    credit?: boolean;
    behavior?: 'newtab' | 'navigate';
    autoFocus?: boolean;
    useMemory?: boolean;
}>(), {
    url: 'https://fedibuzzer.ajr-news.com',
    text: null,
    credit: true,
    behavior: 'newtab',
    autoFocus: false,
    useMemory: false,
});

function doFetch() {
    const instanceDomain = domain.value;
    if (instanceDomain.match(/^\s*$/)) {
        return;
    }
    if (!process.client) {
        return;
    }
    isLoading.value = true;
    if (props.useMemory && !instances.value.includes(instanceDomain)) {
        instances.value.push(instanceDomain);
    }
    window.fetch(`https://fedibuzzer-api.ajr-news.com/api/v1/instance/${instanceDomain}`).then(async (ctx) => {
        const content = await ctx.json();
        if (content.status != 200) {
            switch (content.message.toLowerCase()) {
                case "we don't support this software":
                    alert("現在このインスタンスは対応していません。お手数をおかけしますが、手動でシェアしていただきますようお願いします。");
                    break;
                    case "server returned unknown error":
                        alert("インスタンスからエラーメッセージが返却されました。このシェア機能がインスタンスにブロックされている可能性があります。お手数をおかけしますが、手動でシェアしていただきますようお願いします。");
                        break;
                case "domain is required":
                    alert("ドメインが入力されていません。正しく入力して下さい。");
                    break;
                }
        } else {
            const shareText = props.text ? props.text : `${props.url} #fedibuzzer`;
            if (props.behavior === 'newtab') {
                window.open(content.body.urlScheme.replace("__TEXT__", encodeURIComponent(shareText)).replace("__URL__", encodeURIComponent(props.url)));
            } else if (props.behavior === 'navigate') {
                location.href = content.body.urlScheme.replace("__TEXT__", encodeURIComponent(shareText)).replace("__URL__", encodeURIComponent(props.url));
            }
        }
        isLoading.value = false;
    });
}

const instances = ref<string[]>([]);

onMounted(() => {
    if (process.client) {
        const ls = localStorage.getItem('fedibuzzer_instances');
        if (props.useMemory && ls) {
            instances.value = JSON.parse(ls);
        }
    }
});

watch(instances, (to) => {
    if (props.useMemory && process.client) {
        localStorage.setItem('fedibuzzer_instances', JSON.stringify(to));
    }
}, {
    deep: true,
});
</script>

<style scoped>
.fedibuzzer {
    --border-color: #ccc;
    --text-color: #000;
    --button-background-color: #007bff;
    --button-hover-background-color: #0056b3;
    --button-active-background-color: #003d80;
    display: flex;
    align-items: center;
    border: 2px solid var(--border-color);
    border-radius: 5px;
    padding: 6px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fedibuzzer.dark {
    --border-color: #444;
    --text-color: #fff;
    --button-background-color: #007bff;
    --button-hover-background-color: #0056b3;
    --button-active-background-color: #003d80;
}

@media (prefers-color-scheme: dark) {
    .fedibuzzer.auto {
        --border-color: #444;
        --text-color: #fff;
        --button-background-color: #007bff;
        --button-hover-background-color: #0056b3;
        --button-active-background-color: #003d80;
    }
}

.fedibuzzer input[type="text"] {
    display: block;
    flex-grow: 1;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 4px 8px;
    color: var(--text-color);
}

.fedibuzzer button {
    background-color: var(--button-background-color);
    flex-shrink: 0;
    color: white;
    border: none;
    border-radius: 5px;
    padding: .5em 1em;
    font-size: 1rem;
    margin-left: 8px;
    cursor: pointer;
    transition: background-color 0.1s ease;
}

.fedibuzzer button:not(:disabled):hover,
.fedibuzzer button:not(:disabled):focus-visible {
    background-color: var(--button-hover-background-color);
}

.fedibuzzer button:not(:disabled):active {
    background-color: var(--button-hover-background-color);
}

.fedibuzzer button:disabled {
    opacity: .7;
    cursor: not-allowed;
}

.fedibuzzer button .i {
    display: inline-block;
    text-transform: none;
    height: 1rem;
    width: 1rem;
    vertical-align: text-top;
    margin-right: .25em;
}

.credit {
    font-size: 10px;
    margin: 5px;
    text-align: end;
}

.credit a {
    color: #777;
    text-underline-offset: 2px;
}

@media (max-width: 600px) {
    .fedibuzzer {
        flex-direction: column;
        align-items: stretch;
    }

    .fedibuzzer input[type="text"] {
        padding: 8px 8px;
    }

    .fedibuzzer button {
        margin-top: 8px;
        margin-left: 0;
    }
}
</style>