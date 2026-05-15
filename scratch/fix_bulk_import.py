
import os

file_path = r"d:\Promptro_web\frontend\src\pages\Admin.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                                    if (Array.isArray(data)) {
                                      // Simulated bulk save
                                      setIsLaunching(true);
                                      setTimeout(() => {
                                        setIsLaunching(false);
                                        setShowBulkModal(false);
                                        setMessage(`Successfully imported ${data.length} prompts!`);
                                        setTimeout(() => setMessage(''), 3000);
                                      }, 1500);
                                    }"""

new_block = """                                    if (Array.isArray(data)) {
                                      setIsLaunching(true);
                                      
                                      const newPrompts = data.map((item: any) => ({
                                        id: Date.now() + Math.random(),
                                        title: item.title || 'Untitled Prompt',
                                        image_url: item.image_url || item.image || '',
                                        prompt_text: item.prompt_text || item.prompt || '',
                                        category: item.category || 'Uncategorized',
                                        generated_with: item.generated_with || item.tool || 'ChatGPT',
                                        tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map((t: string) => t.trim())) : [],
                                        visibility: item.visibility || 'public',
                                        is_featured: item.is_featured === true || item.is_featured === 'true' || item.featured === true,
                                        views: 0,
                                        likes: 0,
                                        time: 'Just now'
                                      }));

                                      setPrompts([...newPrompts, ...prompts]);
                                      
                                      setTimeout(() => {
                                        setIsLaunching(false);
                                        setShowBulkModal(false);
                                        setMessage(`Successfully published ${data.length} prompts!`);
                                        setTimeout(() => setMessage(''), 3000);
                                      }, 1500);
                                    }"""

# Try replacing without worrying about exact space count by normalizing spaces if needed,
# but first try exact match.
if old_block in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced!")
else:
    # Try a more flexible match
    import re
    # Escape special characters but allow flexible whitespace
    pattern = re.escape(old_block.strip()).replace(r'\ ', r'\s+')
    if re.search(pattern, content):
        content = re.sub(pattern, new_block, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully replaced with regex!")
    else:
        print("Failed to find the block.")
