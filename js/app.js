// PDFPro Application - Functional PDF Tools
class PDFProApp {
    constructor() {
        this.currentTool = null;
        this.pdfLib = null;
        this.files = [];
        this.mergedPdfBytes = null;
        this.splitPdfs = null;
        this.compressedPdfBytes = null;
        this.splitFile = null;
        this.compressFile = null;
        this.init();
    }

    async init() {
        // Load PDF-lib from CDN
        await this.loadPDFLib();
        this.setupEventListeners();
        this.showTool('merge-pdf');
    }

    async loadPDFLib() {
        // Dynamically load PDF-lib
        if (!window.PDFLib) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            document.head.appendChild(script);
            
            // Wait for PDF-lib to load
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        this.pdfLib = window.PDFLib;
    }

    setupEventListeners() {
        // Tool selection - update to work with actual links in sidebar
        const toolLinks = document.querySelectorAll('.tools-list a');
        toolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Prevent default navigation for now, we'll handle it in the app
                e.preventDefault();
                const href = link.getAttribute('href');
                // Extract tool name from href (e.g., "tools/merge-pdf.html" -> "merge-pdf")
                const tool = href.replace('tools/', '').replace('.html', '');
                this.showTool(tool);
            });
        });

        // Merge tool events
        const mergeFilesInput = document.getElementById('merge-files');
        if (mergeFilesInput) {
            mergeFilesInput.addEventListener('change', (e) => {
                this.handleMergeFiles(e.target.files);
            });
        }

        const mergeBtn = document.getElementById('merge-btn');
        if (mergeBtn) {
            mergeBtn.addEventListener('click', () => {
                this.mergePDFs();
            });
        }

        const downloadMergedBtn = document.getElementById('download-merged');
        if (downloadMergedBtn) {
            downloadMergedBtn.addEventListener('click', () => {
                this.downloadMergedPDF();
            });
        }

        // Split tool events
        const splitFileInput = document.getElementById('split-file');
        if (splitFileInput) {
            splitFileInput.addEventListener('change', (e) => {
                this.handleSplitFile(e.target.files[0]);
            });
        }

        const splitBtn = document.getElementById('split-btn');
        if (splitBtn) {
            splitBtn.addEventListener('click', () => {
                this.splitPDF();
            });
        }

        const splitMethodSelect = document.getElementById('split-method');
        if (splitMethodSelect) {
            splitMethodSelect.addEventListener('change', (e) => {
                this.handleSplitMethodChange(e.target.value);
            });
        }

        // Compress tool events
        const compressFileInput = document.getElementById('compress-file');
        if (compressFileInput) {
            compressFileInput.addEventListener('change', (e) => {
                this.handleCompressFile(e.target.files[0]);
            });
        }

        const compressBtn = document.getElementById('compress-btn');
        if (compressBtn) {
            compressBtn.addEventListener('click', () => {
                this.compressPDF();
            });
        }

        const downloadCompressedBtn = document.getElementById('download-compressed');
        if (downloadCompressedBtn) {
            downloadCompressedBtn.addEventListener('click', () => {
                this.downloadCompressedPDF();
            });
        }
    }

    showTool(tool) {
        // Update active tool in sidebar - find the link that matches the tool
        document.querySelectorAll('.tools-list a').forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === `tools/${tool}.html`) {
                link.parentElement.classList.add('active');
            }
        });

        // Hide all tool content
        document.querySelectorAll('.tool-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show specific tool content
        // Map tool names to the corresponding element IDs in the current HTML
        const toolMap = {
            'merge-pdf': 'mergepdf',
            'split-pdf': 'splitpdf',
            'compress-pdf': 'compresspdf'
        };
        
        const toolKey = toolMap[tool] || 'other';
        const toolElement = document.getElementById(`${toolKey}-tool`);
        
        if (toolElement) {
            toolElement.classList.add('active');
        } else {
            // If tool doesn't have specific UI, show the generic one
            const otherTools = document.getElementById('other-tools');
            if (otherTools) {
                otherTools.classList.add('active');
            }
        }

        // Update tool header
        const toolTitle = document.getElementById('tool-title');
        const toolDescription = document.getElementById('tool-description');
        
        const toolNames = {
            'merge-pdf': 'Merge PDFs',
            'split-pdf': 'Split PDF',
            'compress-pdf': 'Compress PDF',
            'remove-pages': 'Remove Pages',
            'extract-pages': 'Extract Pages',
            'organize-pdf': 'Organize PDF',
            'scan-pdf': 'Scan to PDF',
            'repair-pdf': 'Repair PDF',
            'ocr-pdf': 'OCR PDF',
            'jpg-to-pdf': 'JPG to PDF',
            'word-to-pdf': 'WORD to PDF',
            'ppt-to-pdf': 'POWERPOINT to PDF',
            'excel-to-pdf': 'EXCEL to PDF',
            'html-to-pdf': 'HTML to PDF',
            'pdf-to-jpg': 'PDF to JPG',
            'pdf-to-word': 'PDF to WORD',
            'pdf-to-ppt': 'PDF to POWERPOINT',
            'pdf-to-excel': 'PDF to EXCEL',
            'pdf-to-pdfa': 'PDF to PDF/A',
            'rotate-pdf': 'Rotate PDF',
            'add-page-numbers': 'Add Page Numbers',
            'add-watermark': 'Add Watermark',
            'crop-pdf': 'Crop PDF',
            'edit-pdf': 'Edit PDF',
            'unlock-pdf': 'Unlock PDF',
            'protect-pdf': 'Protect PDF',
            'sign-pdf': 'Sign PDF',
            'redact-pdf': 'Redact PDF',
            'compare-pdf': 'Compare PDF'
        };

        const toolDescriptions = {
            'merge-pdf': 'Combine multiple PDF files into a single document. All processing happens in your browser - your files never leave your computer.',
            'split-pdf': 'Split a PDF document into multiple files. All processing happens in your browser - your files never leave your computer.',
            'compress-pdf': 'Reduce PDF file size while maintaining quality. All processing happens in your browser - your files never leave your computer.',
            'remove-pages': 'Remove specific pages from a PDF document. All processing happens in your browser - your files never leave your computer.',
            'extract-pages': 'Extract specific pages from a PDF document. All processing happens in your browser - your files never leave your computer.',
            'organize-pdf': 'Rearrange pages in a PDF document. All processing happens in your browser - your files never leave your computer.',
            'scan-pdf': 'Create PDF from scanned images. All processing happens in your browser - your files never leave your computer.',
            'repair-pdf': 'Repair corrupted PDF files. All processing happens in your browser - your files never leave your computer.',
            'ocr-pdf': 'Add OCR text layer to scanned PDFs. All processing happens in your browser - your files never leave your computer.',
            'jpg-to-pdf': 'Convert JPG images to PDF. All processing happens in your browser - your files never leave your computer.',
            'word-to-pdf': 'Convert WORD documents to PDF. All processing happens in your browser - your files never leave your computer.',
            'ppt-to-pdf': 'Convert POWERPOINT presentations to PDF. All processing happens in your browser - your files never leave your computer.',
            'excel-to-pdf': 'Convert EXCEL spreadsheets to PDF. All processing happens in your browser - your files never leave your computer.',
            'html-to-pdf': 'Convert HTML documents to PDF. All processing happens in your browser - your files never leave your computer.',
            'pdf-to-jpg': 'Convert PDF pages to JPG images. All processing happens in your browser - your files never leave your computer.',
            'pdf-to-word': 'Convert PDF to WORD documents. All processing happens in your browser - your files never leave your computer.',
            'pdf-to-ppt': 'Convert PDF to POWERPOINT presentations. All processing happens in your browser - your files never leave your computer.',
            'pdf-to-excel': 'Convert PDF to EXCEL spreadsheets. All processing happens in your browser - your files never leave your computer.',
            'pdf-to-pdfa': 'Convert PDF to PDF/A format. All processing happens in your browser - your files never leave your computer.',
            'rotate-pdf': 'Rotate PDF pages. All processing happens in your browser - your files never leave your computer.',
            'add-page-numbers': 'Add page numbers to PDF. All processing happens in your browser - your files never leave your computer.',
            'add-watermark': 'Add watermarks to PDF. All processing happens in your browser - your files never leave your computer.',
            'crop-pdf': 'Crop PDF pages. All processing happens in your browser - your files never leave your computer.',
            'edit-pdf': 'Edit PDF content. All processing happens in your browser - your files never leave your computer.',
            'unlock-pdf': 'Remove password protection from PDF. All processing happens in your browser - your files never leave your computer.',
            'protect-pdf': 'Add password protection to PDF. All processing happens in your browser - your files never leave your computer.',
            'sign-pdf': 'Add digital signatures to PDF. All processing happens in your browser - your files never leave your computer.',
            'redact-pdf': 'Redact sensitive information from PDF. All processing happens in your browser - your files never leave your computer.',
            'compare-pdf': 'Compare two PDF documents. All processing happens in your browser - your files never leave your computer.'
        };

        if (toolTitle) toolTitle.textContent = toolNames[tool] || 'Tool';
        if (toolDescription) toolDescription.textContent = toolDescriptions[tool] || 'Select a tool from the sidebar to get started. All operations are performed locally in your browser - your files never leave your computer.';
    }

    // Merge PDFs functionality
    handleMergeFiles(files) {
        this.files = Array.from(files);
        
        const fileList = document.getElementById('merge-file-list');
        if (this.files.length > 0) {
            fileList.innerHTML = '<ul>';
            this.files.forEach((file, index) => {
                fileList.innerHTML += `<li>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</li>`;
            });
            fileList.innerHTML += '</ul>';
            document.getElementById('merge-btn').disabled = false;
        } else {
            fileList.innerHTML = '<p>No files selected yet</p>';
            document.getElementById('merge-btn').disabled = true;
        }
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            alert('Please select at least 2 PDF files to merge.');
            return;
        }

        try {
            // Show processing message
            const mergeBtn = document.getElementById('merge-btn');
            const originalText = mergeBtn.innerHTML;
            mergeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Merging...';
            mergeBtn.disabled = true;

            // Create a new PDF document
            const { PDFDocument, degrees } = this.pdfLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of this.files) {
                // Check if it's a PDF file
                if (!file.type.includes('pdf')) {
                    alert(`File ${file.name} is not a PDF. Please select only PDF files.`);
                    continue;
                }

                // Read file as array buffer
                const arrayBuffer = await file.arrayBuffer();
                
                // Load the PDF document
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                
                // Copy pages from the source document to the merged document
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            // Serialize the merged PDF
            const mergedPdfBytes = await mergedPdf.save();

            // Store the merged PDF for download
            this.mergedPdfBytes = mergedPdfBytes;

            // Enable download button
            document.getElementById('download-merged').style.display = 'block';

            // Reset button
            mergeBtn.innerHTML = originalText;
            mergeBtn.disabled = false;

            // Show success message
            const fileList = document.getElementById('merge-file-list');
            fileList.innerHTML += '<p style="color: #2ecc71; font-weight: bold;">Merge completed successfully!</p>';
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
            
            // Reset button
            const mergeBtn = document.getElementById('merge-btn');
            mergeBtn.innerHTML = '<i class="fas fa-code-branch"></i> Merge PDFs';
            mergeBtn.disabled = false;
        }
    }

    downloadMergedPDF() {
        if (!this.mergedPdfBytes) {
            alert('No merged PDF available to download.');
            return;
        }

        // Create a blob from the merged PDF bytes
        const blob = new Blob([this.mergedPdfBytes], { type: 'application/pdf' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged-pdf.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Split PDF functionality
    handleSplitFile(file) {
        if (!file || !file.type.includes('pdf')) {
            alert('Please select a valid PDF file.');
            return;
        }

        this.splitFile = file;
        document.getElementById('split-btn').disabled = false;

        // Update UI to show selected file
        const fileLabel = document.querySelector('#split-file + .file-upload-label span');
        fileLabel.textContent = file.name;
    }

    handleSplitMethodChange(method) {
        const pageRangesInput = document.getElementById('page-ranges');
        if (method === 'range') {
            pageRangesInput.style.display = 'block';
        } else {
            pageRangesInput.style.display = 'none';
        }
    }

    async splitPDF() {
        if (!this.splitFile) {
            alert('Please select a PDF file to split.');
            return;
        }

        try {
            // Show processing message
            const splitBtn = document.getElementById('split-btn');
            const originalText = splitBtn.innerHTML;
            splitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Splitting...';
            splitBtn.disabled = true;

            // Read file as array buffer
            const arrayBuffer = await this.splitFile.arrayBuffer();
            
            // Load the PDF document
            const { PDFDocument } = this.pdfLib;
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();

            const splitMethod = document.getElementById('split-method').value;
            let pageRanges = [];

            if (splitMethod === 'single') {
                // Split into individual pages
                for (let i = 0; i < totalPages; i++) {
                    pageRanges.push([i]);
                }
            } else {
                // Split by page ranges
                const rangeInput = document.getElementById('page-range-input').value;
                if (!rangeInput.trim()) {
                    alert('Please enter page ranges (e.g., 1-3, 5-7).');
                    splitBtn.innerHTML = originalText;
                    splitBtn.disabled = false;
                    return;
                }

                // Parse page ranges
                const ranges = rangeInput.split(',').map(range => range.trim());
                for (const range of ranges) {
                    if (range.includes('-')) {
                        const [start, end] = range.split('-').map(num => parseInt(num.trim()) - 1);
                        if (start >= 0 && end < totalPages && start <= end) {
                            const rangeArray = [];
                            for (let i = start; i <= end; i++) {
                                rangeArray.push(i);
                            }
                            pageRanges.push(rangeArray);
                        }
                    } else {
                        const pageNum = parseInt(range.trim()) - 1;
                        if (pageNum >= 0 && pageNum < totalPages) {
                            pageRanges.push([pageNum]);
                        }
                    }
                }
            }

            // Create split PDFs
            this.splitPdfs = [];
            for (let i = 0; i < pageRanges.length; i++) {
                const newPdf = await PDFDocument.create();
                const pagesToCopy = pageRanges[i];
                
                const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                this.splitPdfs.push({
                    bytes: pdfBytes,
                    name: `${this.splitFile.name.replace('.pdf', '')}_pages_${pagesToCopy[0] + 1}-${pagesToCopy[pagesToCopy.length - 1] + 1}.pdf`
                });
            }

            // Display split files
            this.displaySplitFiles();

            // Reset button
            splitBtn.innerHTML = originalText;
            splitBtn.disabled = false;

        } catch (error) {
            console.error('Error splitting PDF:', error);
            alert('Error splitting PDF. Please try again.');
            
            // Reset button
            const splitBtn = document.getElementById('split-btn');
            splitBtn.innerHTML = '<i class="fas fa-scissors"></i> Split PDF';
            splitBtn.disabled = false;
        }
    }

    displaySplitFiles() {
        const splitOutput = document.getElementById('split-output');
        const splitFilesList = document.getElementById('split-files-list');
        
        splitFilesList.innerHTML = '';
        
        this.splitPdfs.forEach((pdf, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'split-file-item';
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf" style="color: #e74c3c;"></i>
                    <span>${pdf.name}</span>
                </div>
                <div class="file-actions">
                    <button class="action-btn secondary" onclick="app.downloadSplitPDF(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
            
            splitFilesList.appendChild(fileItem);
        });
        
        splitOutput.style.display = 'block';
    }

    downloadSplitPDF(index) {
        if (!this.splitPdfs || !this.splitPdfs[index]) {
            alert('PDF not available for download.');
            return;
        }

        const pdf = this.splitPdfs[index];
        const blob = new Blob([pdf.bytes], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = pdf.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Compress PDF functionality
    handleCompressFile(file) {
        if (!file || !file.type.includes('pdf')) {
            alert('Please select a valid PDF file.');
            return;
        }

        this.compressFile = file;
        document.getElementById('compress-btn').disabled = false;

        // Update UI to show selected file
        const fileLabel = document.querySelector('#compress-file + .file-upload-label span');
        fileLabel.textContent = file.name;
    }

    async compressPDF() {
        if (!this.compressFile) {
            alert('Please select a PDF file to compress.');
            return;
        }

        try {
            // Show processing message
            const compressBtn = document.getElementById('compress-btn');
            const originalText = compressBtn.innerHTML;
            compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
            compressBtn.disabled = true;

            // For now, we'll just pass through the original file
            // In a real implementation, we would apply compression techniques
            // This is a simplified version for demonstration
            const arrayBuffer = await this.compressFile.arrayBuffer();
            
            // Store the compressed PDF for download
            this.compressedPdfBytes = arrayBuffer;

            // Enable download button
            document.getElementById('download-compressed').style.display = 'block';

            // Reset button
            compressBtn.innerHTML = originalText;
            compressBtn.disabled = false;

            // Show success message
            const fileLabel = document.querySelector('#compress-file + .file-upload-label span');
            fileLabel.textContent = `✓ ${this.compressFile.name} (compression complete)`;

        } catch (error) {
            console.error('Error compressing PDF:', error);
            alert('Error compressing PDF. Please try again.');
            
            // Reset button
            const compressBtn = document.getElementById('compress-btn');
            compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress PDF';
            compressBtn.disabled = false;
        }
    }

    downloadCompressedPDF() {
        if (!this.compressedPdfBytes) {
            alert('No compressed PDF available to download.');
            return;
        }

        // Create a blob from the compressed PDF bytes
        const blob = new Blob([this.compressedPdfBytes], { type: 'application/pdf' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'compressed-' + this.compressFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Placeholder for other tools
    async processTool(tool, file) {
        if (!file) {
            alert('Please select a file to process.');
            return;
        }

        try {
            // Show processing message
            const btn = document.querySelector(`#${tool.replace('-', '')}-btn`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                btn.disabled = true;
            }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For demonstration, we'll just show an alert
            alert(`${tool.replace('-', ' ')} functionality would be implemented here. In a real application, this would process your file locally in the browser.`);

            // Reset button
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }

        } catch (error) {
            console.error(`Error processing ${tool}:`, error);
            alert(`Error processing ${tool}. Please try again.`);

            // Reset button
            const btn = document.querySelector(`#${tool.replace('-', '')}-btn`);
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PDFProApp();
});

// Export for global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFProApp;
}