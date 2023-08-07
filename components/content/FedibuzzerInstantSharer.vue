<template>
    <div>
        <div class="mb-4">
            <h1 class="text-center text-2xl sm:text-3xl font-bold mb-2">Fediverseにシェア</h1>
            <p class="text-center break-keep">投稿内容を確認し、<wbr>お使いのインスタンスの<wbr>ドメインを入力してください。<br>投稿フォームが<wbr>表示されます。</p>
        </div>
        <div class="mb-4 p-4 rounded-lg border">
            <h2 class="mb-2 font-bold text-xl">ウェブサイトから受け取った投稿内容</h2>
            <div class="whitespace-pre-wrap">
                {{ (query?.text as string) ? query.text : `${query?.url ?? '(URLが指定されていません)'} #fedishare` }}
            </div>
        </div>
        <FedibuzzerPreview :auto-focus="true" :use-memory="true" :credit="false" :behavior="'navigate'" :text="(query?.text as string) ?? null" :url="(query?.url as string) ?? undefined" />
    </div>
</template>

<script setup lang="ts">
const { query } = useRoute();

if (process.client && query.url) {
    if ('sendBeacon' in navigator) {
        let domain: string;
        try {
            const url = new URL(query.url as string);
            domain = url.host;
        } catch (_) {
            domain = query.url as string;
        }
        const data = new URLSearchParams({
            domain,
        });
        navigator.sendBeacon('https://fedibuzzer-api.ajr-news.com/api/v1/record', data);
    }
}
</script>