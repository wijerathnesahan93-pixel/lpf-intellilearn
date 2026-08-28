import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { subjectsApi } from '../../api/subjects.api';
import { topicsApi } from '../../api/topics.api';
import { lessonsApi } from '../../api/lessons.api';
import { materialsApi } from '../../api/materials.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { BookOpen, FileText, ArrowLeft, Video, Image, Download, File, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';

export default function StudentLessonsPage() {
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const navigate = useNavigate();

  const [subject, setSubject] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Viewing Lesson Content
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const fetchData = async () => {
    if (!subjectId) {
      setError('No subject ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [subjectData, topicsRes, lessonsRes, materialsRes] = await Promise.all([
        subjectsApi.getById(subjectId),
        topicsApi.list({ subjectId, limit: 100 }),
        lessonsApi.list({ subjectId, limit: 100 }),
        materialsApi.list({ subjectId, limit: 100 })
      ]);

      setSubject(subjectData);
      setTopics(topicsRes.data || []);
      setLessons(lessonsRes.data || []);
      setMaterials(materialsRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load lessons and materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!subject) return null;

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'IMAGE':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'PRESENTATION':
        return <File className="w-5 h-5 text-orange-500" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMaterialBadge = (type: string) => {
    switch (type) {
      case 'PDF': return <Badge variant="danger">{type}</Badge>;
      case 'VIDEO': return <Badge variant="info">{type}</Badge>;
      case 'IMAGE': return <Badge variant="success">{type}</Badge>;
      case 'PRESENTATION': return <Badge variant="warning">{type}</Badge>;
      case 'DOCUMENT': return <Badge variant="info">{type}</Badge>;
      default: return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to subjects */}
      <button
        onClick={() => navigate('/student/subjects')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Subjects
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider bg-blue-700/50 px-2.5 py-1 rounded-full">
            {subject.code}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            {subject.name}
          </h1>
          <p className="text-blue-100 mt-1 text-sm">
            {subject.description || 'Welcome to your subject study space.'}
          </p>
        </div>
        <div className="hidden sm:block">
          <BookOpen className="w-16 h-16 text-blue-200/50" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar (Topics list) */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            Topics Index
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
            {topics.length > 0 ? (
              topics.map((t: any, index: number) => (
                <a
                  key={t.id}
                  href={`#topic-${t.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {index + 1}. {t.name}
                  </span>
                </a>
              ))
            ) : (
              <p className="text-xs text-gray-400 p-3 text-center">No topics available</p>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {topics.length > 0 ? (
            topics.map((topic: any, tIndex: number) => {
              // Filter lessons & materials for this topic
              const topicLessons = lessons.filter((l: any) => l.topicId === topic.id);
              const topicMaterials = materials.filter((m: any) => m.topicId === topic.id);

              return (
                <div key={topic.id} id={`topic-${topic.id}`} className="space-y-4 scroll-mt-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                      {tIndex + 1}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {topic.name}
                    </h2>
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-500 pl-10">
                      {topic.description}
                    </p>
                  )}

                  {/* Lessons */}
                  <div className="pl-0 sm:pl-10 space-y-4">
                    {topicLessons.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Lessons
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {topicLessons.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                  <BookOpen className="w-4 h-4" />
                                </span>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-800">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    By Teacher: {lesson.teacher?.user?.firstName} {lesson.teacher?.user?.lastName}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                View Content
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {topicMaterials.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Learning Materials
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {topicMaterials.map((material: any) => (
                            <div
                              key={material.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-gray-50">
                                  {getMaterialIcon(material.type)}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-gray-800">
                                      {material.title}
                                    </h4>
                                    {getMaterialBadge(material.type)}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {material.description || 'No description provided.'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                {material.fileUrl ? (
                                  <a
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={material.fileName}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-700 text-xs font-bold rounded-lg transition-all duration-200"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400">No file</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {topicLessons.length === 0 && topicMaterials.length === 0 && (
                      <div className="p-4 bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 rounded-xl">
                        No lessons or study materials available for this topic yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <Card className="p-12 text-center flex flex-col items-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No content available</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                There are no topics or learning materials published for this subject yet.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Lesson View Modal */}
      {selectedLesson && (
        <Modal
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          title={selectedLesson.title}
        >
          <div className="space-y-4 max-w-2xl">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3">
              <Badge variant="info">
                Topic: {selectedLesson.topic?.name || 'General'}
              </Badge>
              <span className="text-xs text-gray-400">
                Created by Teacher: {selectedLesson.teacher?.user?.firstName} {selectedLesson.teacher?.user?.lastName}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed min-h-[200px] bg-gray-50/50 p-4 rounded-xl border border-gray-100 overflow-y-auto max-h-[400px]">
              {selectedLesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p className="text-gray-400 italic">No content available for this lesson.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedLesson(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
