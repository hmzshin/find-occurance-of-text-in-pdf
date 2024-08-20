const { createApp, ref } = Vue;
const app = createApp({
  components: {
    "pdf-search": {
      template: `
        <div class="w-full flex flex-col">
          <h1 class="text-2xl font-bold text-center m-auto mt-10">KELİME BUL</h1> 
          <el-upload
            class="w-1/3 m-auto mt-10"  
            drag
            multiple
            :on-change="onFileChange"
            :auto-upload="false"
            :show-file-list="false" 
            accept="application/pdf"
            v-if="!pdfLoaded" 
          >
            <el-icon><upload-filled /></el-icon>
            <div class="el-upload__text">
            Dosyayı Buraya Sürükle yada <em>yüklemek için tıkla</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                Lütfen PDF Dosyası Yükleyin.
              </div>
            </template>
          </el-upload>

          <div v-if="pdfLoaded" class="w-1/3 m-auto mt-10 flex items-center justify-center">
            <el-icon class="text-5xl"><document /></el-icon>
            <span class="ml-2">{{ fileName }}</span>
          </div>



          <el-input
            v-if="pdfLoaded"
            v-model="searchTerm"
            placeholder="Aramak istediğiniz kelimeyi girin" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 m-auto mt-10"
          />
          <el-button
            type="submit"
            v-if="pdfLoaded"
            class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-lg w-16 sm:w-auto px-10 py-5 text-center m-auto mt-10"
            @click="searchInPdf"
          >
            Ara
          </el-button>


          <div v-if="searchResults.length" class="w-1/3 m-auto mt-10 flex flex-col items-center justify-center">
            <h3 class="text-lg font-bold text-slate-400">   Bulunduğu Sayfalar: {{ searchResults.length }}  Sonuç </h3>

          <ul class="flex">
            <li v-for="(page, index) in searchResults" :key="index">
             {{ page }}<span v-if="index < searchResults.length - 1">,</span>
            </li>
          </ul>
          </div>
        </div>
      `,
      setup() {
        const searchTerm = ref("");
        const searchResults = ref([]);
        const pdfDoc = ref(null);
        const pdfLoaded = ref(false);
        const fileName = ref("");

        const onFileChange = async (file) => {
          if (file) {
            if (file.raw.type !== "application/pdf") {
              alert("Please select a PDF file.");
              return;
            }
            fileName.value = file.name;
            const reader = new FileReader();
            reader.onload = async function () {
              const arrayBuffer = this.result;
              pdfDoc.value = await pdfjsLib.getDocument({ data: arrayBuffer })
                .promise;
              pdfLoaded.value = true;
            };
            reader.readAsArrayBuffer(file.raw);
          }
        };

        const searchInPdf = async () => {
          if (!searchTerm.value) return;
          searchResults.value = [];
          for (let pageNum = 1; pageNum <= pdfDoc.value.numPages; pageNum++) {
            const page = await pdfDoc.value.getPage(pageNum);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map((item) => item.str);
            const fullText = textItems.join(" ");
            if (
              fullText.toLowerCase().includes(searchTerm.value.toLowerCase())
            ) {
              searchResults.value.push(pageNum);
            }
          }
        };

        return {
          searchTerm,
          searchResults,
          pdfLoaded,
          onFileChange,
          searchInPdf,
          fileName,
        };
      },
    },
  },
});

app.use(ElementPlus);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
