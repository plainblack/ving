<template>
    <form class="dropzone">
        <!-- Not displayed, just for Dropzone's `dictDefaultMessage` option -->
        <div id="dropzone-message" style="display: none">
            <div class="dropzone-title">Drop files here or click to select.</div>
            <div class="dropzone-info">{{ info }}</div>
            <div>Accepted file types are: <b>{{ acceptedFiles.join(', ') }}</b></div>
        </div>
    </form>
</template>
  
<script>
import Dropzone from 'dropzone'
import '../node_modules/dropzone/dist/dropzone.css'

Dropzone.autoDiscover = false;

const getSignedURL = async (file) => {
    const response = await useRest(`/api/${useRestVersion()}/s3file?includeMeta=true`, {
        method: 'POST', body: {
            contentType: file.type,
            filename: file.name,
            sizeInBytes: file.size,
        }
    });
    return response.data;
};

export default {
    name: 'dropzone',
    props: {
        afterUpload: {
            type: Function,
            required: true,
        },
        info: {
            type: String,
        },
        resizeWidth: {
            type: Number,
            default: null,
        },
        resizeHeight: {
            type: Number,
            default: null,
        },
        resizeMethod: {
            type: String,
            default: "contain",
        },
        resizeQuality: {
            type: Number,
            default: 1,
        },
        maxFilesize: {
            type: Number,
            default: 100000000,
        },
        maxFiles: {
            type: Number,
            default: null,
        },
        acceptedFiles: {
            type: Array,
            default: () => ['png', 'jpg'],
        },
    },
    mounted() {
        const vm = this;

        let options = {
            // The URL will be changed for each new file being processing
            url: '/',

            // Since we're going to do a `PUT` upload to S3 directly
            method: 'put',

            // https://github.com/kfei/vue-s3-dropzone/issues/4#issuecomment-388421301
            sending(file, xhr) {
                const _send = xhr.send;
                xhr.send = formData => _send.call(xhr, formData.get('file'));
            },

            // apply props for some settings
            acceptedFiles: '.'+vm.acceptedFiles.join(', .'),
            maxFiles: vm.maxFiles,
            maxFilesize: vm.maxFilesize,
            resizeWidth: vm.resizeWidth,
            resizeHeight: vm.resizeHeight,
            resizeMethod: vm.resizeMethod,
            resizeQuality: vm.resizeQuality,

            // Upload one file at a time since we're using the S3 pre-signed URL scenario
            parallelUploads: 1,
            uploadMultiple: false,

            // Content-Type should be included, otherwise you'll get a signature
            // mismatch error from S3. We're going to update this for each file.
            header: '',

            // Customize the wording
            dictDefaultMessage: document.querySelector('#dropzone-message').innerHTML,

            // We're going to process each file manually (see `accept` below)
            autoProcessQueue: false,

            // Here we request a signed upload URL when a file being accepted
            accept(file, done) {
                getSignedURL(file)
                    .then((s3file) => {
                        file.uploadURL = s3file?.meta?.presignedUrl;
                        file.s3file = s3file;
                        done();
                        // Manually process each file
                        setTimeout(() => vm.dropzone.processFile(file))
                    })
                    .catch((err) => {
                        done('Failed to get an S3 signed upload URL', err)
                    })
            },

            success(file) {
                vm.afterUpload(file.s3file, file);
            }
        }

        // Instantiate Dropzone
        this.dropzone = new Dropzone(this.$el, options);

        // Set signed upload URL for each file
        vm.dropzone.on('processing', (file) => {
            vm.dropzone.options.url = file.uploadURL;
        });

        vm.dropzone.on('complete', (file) => {
            vm.dropzone.removeFile(file);
        });
    }
}

</script>
  
<style></style>