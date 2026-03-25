import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../../services/api';
import type { Job, Application } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Search, Upload, FileText, Eye, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user?.email) {
      loadJobs();
      loadApplications();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user?.email) return;
    
    setIsLoadingJobs(true);
    try {
      console.log('Loading jobs for student:', user.email);
      const data = await jobAPI.getAllJobs();
      console.log('Jobs data:', data);
      setJobs(data);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs. Please check your connection and try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    if (!user?.email) return;
    
    setIsLoadingApplications(true);
    try {
      console.log('Loading applications for student:', user.email);
      const data = await applicationAPI.getApplicationsByStudent(user.email);
      console.log('Applications data:', data);
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setResumeUploadStatus('uploading');

    try {
      // Analyze resume using backend Hugging Face AI service
      const analysisResult = await applicationAPI.analyzeResume(file);
      
      if (analysisResult.success) {
        // Create analysis object from the response
        const analysis = {
          cgpa: analysisResult.cgpa || 'N/A',
          skills: analysisResult.skills || 'N/A',
          education: analysisResult.education || 'N/A',
          experience: analysisResult.experience || 'N/A'
        };
        
        setResumeAnalysis(analysis);
        setResumeUploadStatus('success');
        toast.success('Resume uploaded and analyzed successfully by Hugging Face AI!');
      } else {
        setResumeUploadStatus('error');
        toast.error(analysisResult.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error uploading or analyzing resume:', error);
      setResumeUploadStatus('error');
      toast.error('Failed to upload or analyze resume. Please try again.');
    }
  };

  const handleApply = async (jobId: number) => {
    if (!user?.email) return;

    if (!resumeFile) {
      toast.error('Please upload your resume before applying');
      return;
    }

    const formData = new FormData();
    formData.append('jobId', jobId.toString());
    formData.append('studentEmail', user.email);
    formData.append('studentName', user.fullName || user.username);
    formData.append('coverLetter', coverLetter);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      const response = await applicationAPI.createApplication(formData);

      toast.success('Application submitted successfully! You will be notified via email or SMS when your application is reviewed.');
      loadApplications();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hired')) {
      return <Badge className="bg-green-500">Hired</Badge>;
    }
    if (statusLower.includes('shortlisted')) {
      return <Badge className="bg-blue-500">Shortlisted</Badge>;
    }
    if (statusLower.includes('reviewed')) {
      return <Badge className="bg-yellow-500">Reviewed</Badge>;
    }
    if (statusLower.includes('rejected')) {
      return <Badge className="bg-red-500">Rejected</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.requiredSkills.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const appliedJobIds = new Set(applications.map(app => app.jobId));

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Jobs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  id="search"
                  placeholder="Search by title, company, location, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload Resume</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  disabled={resumeUploadStatus === 'uploading' || resumeUploadStatus === 'analyzing'}
                >
                  <Upload className="size-4 mr-2" />
                  {resumeUploadStatus === 'uploading' ? 'Uploading...' : 
                   resumeUploadStatus === 'analyzing' ? 'Analyzing...' :
                   resumeUploadStatus === 'success' ? 'Resume Uploaded' : 'Upload Resume'}
                </Button>
                {resumeFile && (
                  <span className="text-sm text-gray-600">
                    Selected: {resumeFile.name}
                  </span>
                )}
              </div>
              
              {/* Resume Upload Status */}
              {resumeUploadStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  resumeUploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  resumeUploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  {resumeUploadStatus === 'success' ? (
                    <CheckCircle className="size-4 text-green-600" />
                  ) : resumeUploadStatus === 'error' ? (
                    <AlertCircle className="size-4 text-red-600" />
                  ) : (
                    <Upload className="size-4 text-blue-600 animate-pulse" />
                  )}
                  <span className={`text-sm ${
                    resumeUploadStatus === 'success' ? 'text-green-700' :
                    resumeUploadStatus === 'error' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {resumeUploadStatus === 'uploading' && 'Uploading resume...'}
                    {resumeUploadStatus === 'analyzing' && 'Analyzing resume with AI...'}
                    {resumeUploadStatus === 'success' && 'Resume successfully uploaded and analyzed by Hugging Face AI! You can now apply to jobs.'}
                    {resumeUploadStatus === 'error' && 'Error uploading or analyzing resume. Please try again.'}
                  </span>
                </div>
              )}
              
              {/* Resume Analysis Results */}
              {resumeAnalysis && resumeUploadStatus === 'success' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Resume Analysis Results:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">CGPA:</span>
                      <span className="ml-2 font-medium">{resumeAnalysis.cgpa || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Skills:</span>
                      <span className="ml-2 font-medium">{resumeAnalysis.skills || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Education:</span>
                      <span className="ml-2 font-medium">{resumeAnalysis.education || 'Not found'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Available Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Job Postings</CardTitle>
              <CardDescription>Find and apply to job opportunities that match your skills</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="text-center py-8 text-gray-500">Loading jobs...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs found. Try adjusting your search criteria.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge>{job.jobType}</Badge>
                              <Badge variant="secondary">{job.location}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Posted by</p>
                            <p className="font-medium">{job.postedBy}</p>
                            {job.salary && (
                              <p className="text-sm font-semibold text-green-600 mt-1">₹{job.salary}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Required Skills</p>
                            <p className="font-medium">{job.requiredSkills}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Education Required</p>
                            <p className="font-medium">{job.educationRequired || 'Not specified'}</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{job.description}</p>

                        <div className="flex gap-2">
                          {appliedJobIds.has(job.id!) ? (
                            <Badge className="bg-blue-500">Applied</Badge>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleApply(job.id!)}
                                disabled={!resumeFile}
                              >
                                <FileText className="size-4 mr-2" />
                                Apply Now
                              </Button>
                              {!resumeFile && (
                                <p className="text-sm text-red-500 mt-2">Please upload your resume to apply</p>
                              )}
                            </>
                          )}
                          <Button variant="outline">
                            <Eye className="size-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p><strong>Debug Info:</strong></p>
                  <p>User email: {user?.email}</p>
                  <p>Is loading: {isLoadingApplications ? 'Yes' : 'No'}</p>
                  <p>Applications count: {applications.length}</p>
                  <p>Applications data: {JSON.stringify(applications, null, 2)}</p>
                </div>
                
                {isLoadingApplications ? (
                  <div className="text-center py-8 text-gray-500">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applications found. Start applying to jobs!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job ID</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>{app.jobId}</TableCell>
                            <TableCell>{app.studentName}</TableCell>
                            <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              {app.resumeUrl && (
                                <Button variant="outline" size="sm">
                                  <Eye className="size-4 mr-2" />
                                  View Resume
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};