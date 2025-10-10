<?php

namespace Database\Seeders;

use App\Models\Paper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaperSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $papers = [
            [
                'title' => 'Machine Learning Applications in Natural Language Processing',
                'abstract' => 'This paper explores various machine learning techniques applied to natural language processing tasks, including sentiment analysis, text classification, and language translation. We present a comprehensive survey of recent advances and their practical applications.',
                'year' => 2023,
                'type' => 'journal_article',
                'doi' => '10.1000/182',
                'venue_name' => 'Journal of Artificial Intelligence Research',
                'volume' => '45',
                'issue' => '3',
                'pages' => '123-145',
                'url_fulltext' => 'https://example.com/paper1',
                'visibility' => 'public',
            ],
            [
                'title' => 'Deep Learning for Computer Vision: A Comprehensive Review',
                'abstract' => 'This comprehensive review covers the latest developments in deep learning for computer vision applications. We discuss convolutional neural networks, attention mechanisms, and their applications in image recognition, object detection, and medical imaging.',
                'year' => 2023,
                'type' => 'conference_paper',
                'doi' => '10.1000/183',
                'venue_name' => 'IEEE Conference on Computer Vision and Pattern Recognition',
                'volume' => null,
                'issue' => null,
                'pages' => '456-470',
                'url_fulltext' => 'https://example.com/paper2',
                'visibility' => 'public',
            ],
            [
                'title' => 'Blockchain Technology in Supply Chain Management',
                'abstract' => 'This paper investigates the implementation of blockchain technology in supply chain management systems. We analyze its benefits, challenges, and provide case studies from various industries.',
                'year' => 2022,
                'type' => 'journal_article',
                'doi' => '10.1000/184',
                'venue_name' => 'International Journal of Information Management',
                'volume' => '62',
                'issue' => '2',
                'pages' => '78-95',
                'url_fulltext' => 'https://example.com/paper3',
                'visibility' => 'institution',
            ],
            [
                'title' => 'Cloud Computing Security: Challenges and Solutions',
                'abstract' => 'As cloud computing becomes more prevalent, security concerns have grown significantly. This paper examines current security challenges and presents innovative solutions for cloud infrastructure protection.',
                'year' => 2022,
                'type' => 'book',
                'doi' => null,
                'venue_name' => 'Tech Publishers',
                'volume' => '1',
                'issue' => null,
                'pages' => '1-300',
                'url_fulltext' => 'https://example.com/book1',
                'visibility' => 'public',
            ],
            [
                'title' => 'IoT Security Framework for Smart Cities',
                'abstract' => 'This paper proposes a comprehensive security framework for Internet of Things (IoT) implementations in smart cities. The framework addresses data privacy, device authentication, and network security.',
                'year' => 2024,
                'type' => 'conference_paper',
                'doi' => '10.1000/185',
                'venue_name' => 'ACM Conference on Computer and Communications Security',
                'volume' => null,
                'issue' => null,
                'pages' => '234-248',
                'url_fulltext' => 'https://example.com/paper4',
                'visibility' => 'public',
            ],
            [
                'title' => 'Data Mining Techniques for Educational Analytics',
                'abstract' => 'Educational institutions generate vast amounts of data that can be analyzed to improve learning outcomes. This paper presents various data mining techniques applied to educational datasets.',
                'year' => 2023,
                'type' => 'report',
                'doi' => null,
                'venue_name' => 'Educational Technology Research Institute',
                'volume' => null,
                'issue' => 'TR-2023-001',
                'pages' => '1-150',
                'url_fulltext' => 'https://example.com/report1',
                'visibility' => 'institution',
            ],
            [
                'title' => 'Quantum Computing Algorithms for Optimization Problems',
                'abstract' => 'This paper explores quantum computing algorithms specifically designed for solving complex optimization problems. We present theoretical foundations and practical implementations.',
                'year' => 2024,
                'type' => 'journal_article',
                'doi' => '10.1000/186',
                'venue_name' => 'Quantum Information Processing',
                'volume' => '23',
                'issue' => '1',
                'pages' => '67-89',
                'url_fulltext' => 'https://example.com/paper5',
                'visibility' => 'private',
            ],
            [
                'title' => 'Artificial Intelligence in Healthcare: Current Trends and Future Prospects',
                'abstract' => 'Healthcare is being transformed by artificial intelligence technologies. This paper reviews current applications in diagnosis, treatment planning, and patient monitoring.',
                'year' => 2023,
                'type' => 'chapter',
                'doi' => null,
                'venue_name' => 'Handbook of AI in Medicine',
                'volume' => '2',
                'issue' => null,
                'pages' => '45-78',
                'url_fulltext' => 'https://example.com/chapter1',
                'visibility' => 'public',
            ],
            [
                'title' => 'Large-Scale Machine Learning Dataset for Text Classification',
                'abstract' => 'We present a comprehensive dataset containing over 1 million text documents with various classification labels. This dataset can be used for training and evaluating text classification models.',
                'year' => 2024,
                'type' => 'dataset',
                'doi' => '10.1000/187',
                'venue_name' => 'Data Repository',
                'volume' => null,
                'issue' => 'v1.0',
                'pages' => null,
                'url_fulltext' => 'https://example.com/dataset1',
                'visibility' => 'public',
            ],
            [
                'title' => 'Cybersecurity Threats in Modern Web Applications',
                'abstract' => 'This paper analyzes the most common cybersecurity threats affecting modern web applications and provides practical recommendations for developers and system administrators.',
                'year' => 2022,
                'type' => 'other',
                'doi' => null,
                'venue_name' => 'Security Research Institute',
                'volume' => null,
                'issue' => null,
                'pages' => '1-50',
                'url_fulltext' => 'https://example.com/other1',
                'visibility' => 'public',
            ],
        ];

        foreach ($papers as $paperData) {
            // Generate normalized title
            $paperData['normalized_title'] = Paper::normalizeTitle($paperData['title']);

            // Generate fingerprint hash
            $paperData['fingerprint_hash'] = sha1($paperData['title'] . $paperData['year']);

            // Generate UUID for paper_id
            $paperData['paper_id'] = Str::uuid();

            Paper::create($paperData);
        }

        $this->command->info('PaperSeeder: ' . count($papers) . ' sample papers created successfully.');
    }
}
